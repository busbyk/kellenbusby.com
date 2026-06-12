#!/usr/bin/env node

import { readdir, copyFile, unlink } from 'node:fs/promises'
import { join, dirname, extname, basename } from 'node:path'
import { parseArgs } from 'node:util'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const BLOG_DIR = join(ROOT, 'src/content/blog')

const CONVERTIBLE = new Set(['.jpg', '.jpeg', '.png', '.tiff', '.avif'])
const HEIC_FORMATS = new Set(['.heic', '.heif'])
const PASSTHROUGH = new Set(['.gif', '.webp'])

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
  console.log(`Usage: pnpm process-images <post-slug> [options]

Processes images from a post's images/raw/ directory into optimized webp files.

Options:
  --quality <n>     WebP quality 1-100 (default: 92)
  --file <name>     Process only this file from raw/ (can specify multiple times)
  --help            Show this help

Examples:
  pnpm process-images my-post-slug
  pnpm process-images my-post-slug --quality 90
  pnpm process-images my-post-slug --file IMG001.jpg --file IMG002.jpg`)
  process.exit(0)
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      // Source webp is re-encoded by Astro's image pipeline at build time, so
      // keep this near-lossless to avoid visible double-compression artifacts.
      quality: { type: 'string', default: '92' },
      file: { type: 'string', multiple: true },
      help: { type: 'boolean', default: false },
    },
  })

  if (values.help) usage()

  const slug = positionals[0]
  if (!slug) {
    console.error('Error: post slug is required')
    usage()
  }

  const quality = parseInt(values.quality, 10)
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

  // Filter to image files
  files = files.filter((f) => {
    const ext = extname(f).toLowerCase()
    return CONVERTIBLE.has(ext) || HEIC_FORMATS.has(ext) || PASSTHROUGH.has(ext)
  })

  // If --file specified, filter to only those
  if (values.file) {
    const requested = new Set(values.file)
    files = files.filter((f) => requested.has(f))
  }

  if (files.length === 0) {
    console.log('No images to process.')
    return
  }

  console.log(`Processing ${files.length} image(s)...\n`)

  const imports = []

  for (const file of files.sort()) {
    const ext = extname(file).toLowerCase()
    const rawName = basename(file, extname(file))
    const kebab = toKebab(rawName)
    const srcPath = join(rawDir, file)

    if (PASSTHROUGH.has(ext)) {
      // Copy as-is (gif, webp)
      const outPath = join(outDir, `${kebab}${ext}`)
      await copyFile(srcPath, outPath)
      const importName = toImportName(kebab)
      imports.push({ importName, fileName: `${kebab}${ext}` })
      console.log(`  Copied: ${file} -> ${kebab}${ext}`)
    } else if (HEIC_FORMATS.has(ext)) {
      // HEIC: use macOS sips to convert to PNG first, then sharp to webp
      const outPath = join(outDir, `${kebab}.webp`)
      const tmpPath = join(tmpdir(), `${kebab}-${Date.now()}.png`)
      try {
        execFileSync('sips', ['-s', 'format', 'png', srcPath, '--out', tmpPath], {
          stdio: 'pipe',
        })
        // sips passes the EXIF orientation tag through without baking it in;
        // .rotate() (no args) auto-applies it so portrait/HEIC shots aren't sideways.
        await sharp(tmpPath).rotate().webp({ quality }).toFile(outPath)
        await unlink(tmpPath)
        const importName = toImportName(kebab)
        imports.push({ importName, fileName: `${kebab}.webp` })
        console.log(`  Converted: ${file} -> ${kebab}.webp (via sips)`)
      } catch (err) {
        console.error(`  Error processing ${file}: ${err.message}`)
        try { await unlink(tmpPath) } catch {}
      }
    } else if (CONVERTIBLE.has(ext)) {
      const outPath = join(outDir, `${kebab}.webp`)
      try {
        await sharp(srcPath)
          .rotate() // auto-apply EXIF orientation so images aren't rotated sideways
          .webp({ quality })
          .toFile(outPath)
        const importName = toImportName(kebab)
        imports.push({ importName, fileName: `${kebab}.webp` })
        console.log(`  Converted: ${file} -> ${kebab}.webp`)
      } catch (err) {
        console.error(`  Error processing ${file}: ${err.message}`)
      }
    }
  }

  if (imports.length > 0) {
    console.log('\n--- Import statements ---\n')
    for (const { importName, fileName } of imports) {
      console.log(`import ${importName} from './images/${fileName}'`)
    }
    console.log()
  }
}

main().catch(console.error)
