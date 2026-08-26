#!/usr/bin/env node

import { stat, unlink } from 'node:fs/promises'
import { join, dirname, extname, basename, resolve, isAbsolute } from 'node:path'
import { parseArgs } from 'node:util'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

function usage() {
  console.log(`Usage: pnpm mp4-to-gif <file.mp4> [more.mp4...] [options]

Converts video files to .gif using a two-pass palette for good quality.
Paths are resolved relative to the current directory; the .gif is written
alongside the source unless --out is given.

Options:
  --fps <n>      Frames per second (default: 15)
  --width <n>    Output width in px, height auto-scaled (default: 600)
  --colors <n>   Max colors in the palette, 2-256 (default: 256)
  --start <t>    Start time, e.g. 3 or 00:00:03 (default: start of clip)
  --duration <t> Length to capture in seconds (default: whole clip)
  --out <path>   Output path (only valid with a single input)
  --help         Show this help

Examples:
  pnpm mp4-to-gif clip.mp4
  pnpm mp4-to-gif clip.mp4 --width 480 --fps 12 --colors 128
  pnpm mp4-to-gif clip.mp4 --start 5 --duration 3 --out clip.gif`)
  process.exit(0)
}

const VIDEO_EXTS = new Set(['.mp4', '.mov', '.m4v', '.webm', '.avi', '.mkv'])

function resolvePath(p) {
  return isAbsolute(p) ? p : resolve(process.cwd(), p)
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      fps: { type: 'string', default: '15' },
      width: { type: 'string', default: '600' },
      colors: { type: 'string', default: '256' },
      start: { type: 'string' },
      duration: { type: 'string' },
      out: { type: 'string' },
      help: { type: 'boolean', default: false },
    },
  })

  if (values.help || positionals.length === 0) usage()

  if (values.out && positionals.length > 1) {
    console.error('Error: --out can only be used with a single input file')
    process.exit(1)
  }

  const fps = parseInt(values.fps, 10)
  const width = parseInt(values.width, 10)
  const colors = parseInt(values.colors, 10)

  // -lanczos scaling, palettegen/paletteuse for quality
  const filters =
    `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];` +
    `[s0]palettegen=max_colors=${colors}[p];[s1][p]paletteuse=dither=bayer`

  let converted = 0

  for (const input of positionals) {
    const srcPath = resolvePath(input)

    if (!VIDEO_EXTS.has(extname(srcPath).toLowerCase())) {
      console.error(`  Skipped: ${input} (not a recognized video file)`)
      continue
    }

    try {
      await stat(srcPath)
    } catch {
      console.error(`  Error: could not find ${input}`)
      continue
    }

    const outPath = values.out
      ? resolvePath(values.out)
      : join(dirname(srcPath), `${basename(srcPath, extname(srcPath))}.gif`)

    // Trim flags go before -i so seeking is fast and accurate
    const trim = []
    if (values.start) trim.push('-ss', values.start)
    if (values.duration) trim.push('-t', values.duration)

    const args = [
      '-y',
      ...trim,
      '-i', srcPath,
      '-filter_complex', filters,
      '-loop', '0',
      outPath,
    ]

    try {
      execFileSync('ffmpeg', args, { stdio: 'pipe' })
      const { size } = await stat(outPath)
      const rel = outPath.startsWith(ROOT) ? outPath.slice(ROOT.length + 1) : outPath
      const mb = (size / 1024 / 1024).toFixed(1)
      console.log(`  Converted: ${input} -> ${rel} (${mb} MB)`)
      converted++
    } catch (err) {
      // ffmpeg writes the useful detail to stderr
      const detail = err.stderr ? err.stderr.toString().trim().split('\n').slice(-3).join('\n') : err.message
      console.error(`  Error converting ${input}:\n${detail}`)
      try { await unlink(outPath) } catch {}
    }
  }

  if (converted === 0) process.exit(1)
}

main().catch(console.error)
