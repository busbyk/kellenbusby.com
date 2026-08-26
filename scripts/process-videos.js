#!/usr/bin/env node

import { readdir, stat, unlink } from 'node:fs/promises'
import { join, dirname, extname, basename } from 'node:path'
import { parseArgs } from 'node:util'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const BLOG_DIR = join(ROOT, 'src/content/blog')

const VIDEO_EXTS = new Set(['.mp4', '.mov', '.m4v', '.webm', '.mkv', '.avi'])

function toKebab(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function toImportName(kebab) {
  return kebab.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())
}

function usage() {
  console.log(`Usage: pnpm process-videos <post-slug> [options]

Compresses videos from a post's images/raw/ directory into web-ready H.264
mp4 files (long edge capped, faststart for streaming) and extracts a poster
frame as webp for each.

Options:
  --crf <n>         H.264 quality, lower = better/bigger (default: 26)
  --max <n>         Max long-edge resolution in px (default: 1920)
  --file <name>     Process only this file from raw/ (can specify multiple times)
  --mute            Strip the audio track (handy for windy ski clips)
  --help            Show this help

Examples:
  pnpm process-videos my-post-slug
  pnpm process-videos my-post-slug --crf 24 --mute
  pnpm process-videos my-post-slug --file VID001.mp4 --file VID002.mp4`)
  process.exit(0)
}

function probe(file, entries) {
  return execFileSync(
    'ffprobe',
    ['-v', 'error', '-select_streams', 'v:0', '-show_entries', `stream=${entries}`, '-of', 'csv=p=0', file],
    { stdio: 'pipe' },
  )
    .toString()
    .trim()
    .replace(/,+$/, '') // ffprobe's csv writer leaves a trailing separator
}

function probeDimensions(file) {
  // Probe the encoded output, so phone rotation metadata is already baked in
  const [width, height] = probe(file, 'width,height').split(',').map(Number)
  return { width, height }
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      crf: { type: 'string', default: '26' },
      max: { type: 'string', default: '1920' },
      file: { type: 'string', multiple: true },
      mute: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
  })

  if (values.help) usage()

  const slug = positionals[0]
  if (!slug) {
    console.error('Error: post slug is required')
    usage()
  }

  const crf = parseInt(values.crf, 10)
  const max = parseInt(values.max, 10)
  const postDir = join(BLOG_DIR, slug)
  const rawDir = join(postDir, 'images', 'raw')
  const outDir = join(postDir, 'images')

  let files
  try {
    files = await readdir(rawDir)
  } catch {
    console.error(`Error: could not read ${rawDir}`)
    console.error('Make sure the post exists and has an images/raw/ directory.')
    process.exit(1)
  }

  files = files.filter((f) => VIDEO_EXTS.has(extname(f).toLowerCase()))

  if (values.file) {
    const requested = new Set(values.file)
    files = files.filter((f) => requested.has(f))
  }

  if (files.length === 0) {
    console.log('No videos to process.')
    return
  }

  console.log(`Processing ${files.length} video(s)...\n`)

  const results = []

  for (const file of files.sort()) {
    const rawName = basename(file, extname(file))
    const kebab = toKebab(rawName)
    const srcPath = join(rawDir, file)
    const outPath = join(outDir, `${kebab}.mp4`)
    const posterPath = join(outDir, `${kebab}-poster.webp`)
    const tmpFrame = join(tmpdir(), `${kebab}-poster-${process.pid}.png`)

    // Cap the long edge at --max without upscaling; H.264 needs even dimensions
    const scale = `scale='min(${max},iw)':'min(${max},ih)':force_original_aspect_ratio=decrease:force_divisible_by=2`
    const audio = values.mute ? ['-an'] : ['-c:a', 'aac', '-b:a', '128k']

    const args = [
      '-y',
      '-i', srcPath,
      '-vf', scale,
      '-c:v', 'libx264',
      '-crf', String(crf),
      '-preset', 'slow',
      // phones often record 10-bit HEVC; yuv420p keeps playback compatible everywhere
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      ...audio,
      outPath,
    ]

    try {
      execFileSync('ffmpeg', args, { stdio: 'pipe' })

      // Probe display dimensions before any remux — the encode bakes phone
      // rotation metadata in, so portrait detection is reliable here
      const { width, height } = probeDimensions(outPath)

      const { size: inSize } = await stat(srcPath)
      let { size: outSize } = await stat(outPath)
      let note = ''
      if (outSize >= inSize && probe(srcPath, 'codec_name') === 'h264') {
        // Source is already a lean h264 encode the re-encode can't beat;
        // remux losslessly instead (keeps original quality, adds faststart)
        try {
          execFileSync(
            'ffmpeg',
            ['-y', '-i', srcPath, '-c', 'copy', ...(values.mute ? ['-an'] : []), '-movflags', '+faststart', outPath],
            { stdio: 'pipe' },
          )
          ;({ size: outSize } = await stat(outPath))
          note = ', already compressed — kept original encode'
        } catch {
          // remux can fail on exotic audio codecs; the re-encode is still valid
        }
      }

      // Poster: first frame of the output, webp'd via sharp
      execFileSync('ffmpeg', ['-y', '-i', outPath, '-frames:v', '1', tmpFrame], { stdio: 'pipe' })
      await sharp(tmpFrame).webp({ quality: 85 }).toFile(posterPath)
      await unlink(tmpFrame)

      const inMb = (inSize / 1024 / 1024).toFixed(1)
      const outMb = (outSize / 1024 / 1024).toFixed(1)

      results.push({ kebab, portrait: height > width })
      console.log(`  Converted: ${file} -> ${kebab}.mp4 (${inMb} MB -> ${outMb} MB${note}) + ${kebab}-poster.webp`)
    } catch (err) {
      // ffmpeg writes the useful detail to stderr
      const detail = err.stderr ? err.stderr.toString().trim().split('\n').slice(-3).join('\n') : err.message
      console.error(`  Error converting ${file}:\n${detail}`)
      try { await unlink(tmpFrame) } catch {}
      try { await unlink(outPath) } catch {}
    }
  }

  if (results.length > 0) {
    console.log('\n--- Import statements ---\n')
    for (const { kebab } of results) {
      const name = toImportName(kebab)
      console.log(`import ${name} from './images/${kebab}.mp4'`)
      console.log(`import ${name}Poster from './images/${kebab}-poster.webp?url'`)
    }
    console.log('\n--- Usage ---\n')
    for (const { kebab, portrait } of results) {
      const name = toImportName(kebab)
      console.log(`<BlogVideo src={${name}} poster={${name}Poster}${portrait ? ' portrait' : ''} caption="" />`)
    }
    console.log()
  }
}

main().catch(console.error)
