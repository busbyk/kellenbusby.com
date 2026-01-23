#!/usr/bin/env node

import { readFile, writeFile, mkdir, readdir, access } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { parseArgs } from 'node:util'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const BLOG_DIR = join(ROOT, 'src/content/blog')
const PUBLIC_DIR = join(ROOT, 'public')
const OG_OUTPUT_DIR = join(PUBLIC_DIR, 'og')
const INSTAGRAM_OUTPUT_DIR = join(PUBLIC_DIR, 'instagram')
const FONT_PATH = join(PUBLIC_DIR, 'font/Rubik-VariableFont_wght.ttf')

// Image dimensions
const OG_WIDTH = 1200
const OG_HEIGHT = 630
const INSTAGRAM_WIDTH = 1080
const INSTAGRAM_HEIGHT = 1350

// Brand colors
const COLORS = {
  background: '#0f172a',
  primary: '#7fb3c8',
  accent: '#f59432',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
}

// Parse CLI arguments
const { values, positionals } = parseArgs({
  options: {
    all: { type: 'boolean', default: false },
    'og-only': { type: 'boolean', default: false },
    'instagram-only': { type: 'boolean', default: false },
    force: { type: 'boolean', default: false },
    help: { type: 'boolean', default: false },
  },
  allowPositionals: true,
})

function showHelp() {
  console.log(`
Usage: pnpm social-image [slug] [options]

Generate social share images for blog posts.

Arguments:
  slug              Blog post slug (folder name under src/content/blog/)

Options:
  --all             Generate images for all blog posts
  --og-only         Generate only Open Graph images (1200x630)
  --instagram-only  Generate only Instagram images (1080x1350)
  --force           Overwrite existing images
  --help            Show this help message

Examples:
  pnpm social-image cardonomics
  pnpm social-image --all
  pnpm social-image cardonomics --og-only --force
`)
}

// Simple frontmatter parser
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return null

  const yaml = match[1]
  const data = {}

  // Parse each line
  const lines = yaml.split('\n')
  let currentKey = null
  let inArray = false
  let inMultiline = false
  let multilineIndent = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip comments
    if (line.trim().startsWith('#')) continue

    // Handle multiline string continuation
    if (inMultiline) {
      const indent = line.match(/^(\s*)/)[1].length
      if (indent >= multilineIndent && line.trim()) {
        // Continuation of multiline value
        const trimmedLine = line.trim()
        data[currentKey] = data[currentKey] ? `${data[currentKey]} ${trimmedLine}` : trimmedLine
        continue
      } else if (!line.trim()) {
        // Empty line in multiline - keep collecting
        continue
      } else {
        // End of multiline
        inMultiline = false
      }
    }

    // Check for array item
    if (inArray && line.match(/^\s+-\s+/)) {
      const value = line.replace(/^\s+-\s+/, '').trim()
      data[currentKey].push(value.replace(/^['"]|['"]$/g, ''))
      continue
    }

    // Check for key: value
    const keyMatch = line.match(/^(\w+):\s*(.*)$/)
    if (keyMatch) {
      const [, key, value] = keyMatch
      inArray = false
      currentKey = key

      // Check for YAML multiline indicators (>-, >, |-, |)
      if (value === '>-' || value === '>' || value === '|-' || value === '|') {
        data[key] = ''
        inMultiline = true
        multilineIndent = 2 // Standard YAML indent
        continue
      }

      if (value === '' || value === '[]') {
        // Could be array or empty
        if (value === '[]') {
          data[key] = []
        } else {
          // Check next line to determine if it's an array
          const nextLine = lines[i + 1]
          if (nextLine && nextLine.match(/^\s+-\s+/)) {
            data[key] = []
            inArray = true
          }
        }
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Inline array
        const items = value.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''))
        data[key] = items.filter(Boolean)
      } else {
        // Simple value
        data[key] = value.replace(/^['"]|['"]$/g, '')
      }
    }
  }

  return data
}

async function fileExists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function getAllPosts() {
  const entries = await readdir(BLOG_DIR, { withFileTypes: true })
  const posts = []

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const slug = entry.name
      const post = await getPost(slug)
      if (post) posts.push(post)
    }
  }

  return posts
}

async function getPost(slug) {
  const mdxPath = join(BLOG_DIR, slug, 'index.mdx')

  if (!(await fileExists(mdxPath))) {
    return null
  }

  const content = await readFile(mdxPath, 'utf-8')
  const frontmatter = parseFrontmatter(content)

  if (!frontmatter) return null

  // Resolve hero image path if present
  let heroImagePath = null
  if (frontmatter.heroImage) {
    const relativePath = frontmatter.heroImage.replace(/^\.\//, '')
    heroImagePath = join(BLOG_DIR, slug, relativePath)
  }

  return {
    slug,
    title: frontmatter.title || slug,
    description: frontmatter.description || '',
    tags: frontmatter.tags || [],
    heroImagePath,
  }
}

// Word wrap text to fit within maxWidth (approximate character count)
function wrapText(text, maxCharsPerLine) {
  const words = text.split(' ')
  const lines = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  if (currentLine) lines.push(currentLine)

  return lines
}

// Truncate text with ellipsis
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3).trim() + '...'
}

// Escape XML special characters
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Read font file and convert to base64
async function getFontBase64() {
  const fontBuffer = await readFile(FONT_PATH)
  return fontBuffer.toString('base64')
}

// Create SVG with text
function createTextSvg(options) {
  const {
    width,
    height,
    title,
    description,
    tags,
    siteUrl,
    fontBase64,
    hasHeroImage = false,
  } = options

  const titleLines = wrapText(title, 35)
  const truncatedTitleLines = titleLines.slice(0, 3)
  if (titleLines.length > 3) {
    truncatedTitleLines[2] = truncateText(truncatedTitleLines[2], 32) + '...'
  }

  const descLines = wrapText(description, 55).slice(0, 2)
  const tagText = tags.slice(0, 3).join(' · ')

  const titleFontSize = titleLines[0].length > 25 ? 48 : 56
  const titleLineHeight = titleFontSize * 1.2

  let titleY = height * 0.35
  const titleBlockHeight = truncatedTitleLines.length * titleLineHeight
  const descY = titleY + titleBlockHeight + 40

  const titleElements = truncatedTitleLines.map((line, i) =>
    `<text x="${width / 2}" y="${titleY + i * titleLineHeight}"
           font-family="Rubik" font-size="${titleFontSize}" font-weight="700"
           fill="${COLORS.textPrimary}" text-anchor="middle">${escapeXml(line)}</text>`
  ).join('\n    ')

  const descElements = descLines.map((line, i) =>
    `<text x="${width / 2}" y="${descY + i * 32}"
           font-family="Rubik" font-size="24" font-weight="400"
           fill="${COLORS.textSecondary}" text-anchor="middle">${escapeXml(line)}</text>`
  ).join('\n    ')

  // Only include background rect if no hero image (hero image provides its own background)
  const backgroundRect = hasHeroImage ? '' : `<rect width="${width}" height="${height}" fill="${COLORS.background}"/>`

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: 'Rubik';
        src: url(data:font/ttf;base64,${fontBase64}) format('truetype');
      }
    </style>
  </defs>

  <!-- Background -->
  ${backgroundRect}

  <!-- Accent line at top -->
  <rect x="0" y="0" width="${width}" height="6" fill="${COLORS.accent}"/>

  <!-- Title -->
  ${titleElements}

  <!-- Description -->
  ${descElements}

  <!-- Site URL (bottom left) -->
  <text x="60" y="${height - 50}"
        font-family="Rubik" font-size="22" font-weight="500"
        fill="${COLORS.primary}">${siteUrl}</text>

  <!-- Tags (bottom right) -->
  ${tagText ? `<text x="${width - 60}" y="${height - 50}"
        font-family="Rubik" font-size="18" font-weight="400"
        fill="${COLORS.textSecondary}" text-anchor="end">${escapeXml(tagText)}</text>` : ''}
</svg>`
}

// Create Instagram SVG
function createInstagramSvg(options) {
  const {
    width,
    height,
    title,
    siteUrl,
    fontBase64,
    hasHeroImage = false,
  } = options

  const titleLines = wrapText(title, 22)
  const truncatedTitleLines = titleLines.slice(0, 4)
  if (titleLines.length > 4) {
    truncatedTitleLines[3] = truncateText(truncatedTitleLines[3], 19) + '...'
  }

  const titleFontSize = titleLines[0].length > 18 ? 52 : 60
  const titleLineHeight = titleFontSize * 1.25

  const titleBlockHeight = truncatedTitleLines.length * titleLineHeight
  const titleY = (height - titleBlockHeight) / 2 + titleFontSize * 0.8

  const titleElements = truncatedTitleLines.map((line, i) =>
    `<text x="${width / 2}" y="${titleY + i * titleLineHeight}"
           font-family="Rubik" font-size="${titleFontSize}" font-weight="700"
           fill="${COLORS.textPrimary}" text-anchor="middle">${escapeXml(line)}</text>`
  ).join('\n    ')

  // Only include background rect if no hero image
  const backgroundRect = hasHeroImage ? '' : `<rect width="${width}" height="${height}" fill="${COLORS.background}"/>`
  // Hide decorative circle when hero image is present (it competes visually)
  const decorativeCircle = hasHeroImage ? '' : `<circle cx="${width / 2}" cy="${height * 0.15}" r="40" fill="none" stroke="${COLORS.primary}" stroke-width="3" opacity="0.5"/>`

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: 'Rubik';
        src: url(data:font/ttf;base64,${fontBase64}) format('truetype');
      }
    </style>
  </defs>

  <!-- Background -->
  ${backgroundRect}

  <!-- Accent lines -->
  <rect x="0" y="0" width="${width}" height="8" fill="${COLORS.accent}"/>
  <rect x="0" y="${height - 8}" width="${width}" height="8" fill="${COLORS.accent}"/>

  <!-- Decorative circle -->
  ${decorativeCircle}

  <!-- Title -->
  ${titleElements}

  <!-- Site URL (bottom center) -->
  <text x="${width / 2}" y="${height - 80}"
        font-family="Rubik" font-size="28" font-weight="500"
        fill="${COLORS.primary}" text-anchor="middle">${siteUrl}</text>
</svg>`
}

async function generateOgImage(post, force = false) {
  const outputPath = join(OG_OUTPUT_DIR, `${post.slug}.png`)

  if (!force && await fileExists(outputPath)) {
    console.log(`  Skipping OG image (exists): ${post.slug}`)
    return
  }

  const fontBase64 = await getFontBase64()

  const svg = createTextSvg({
    width: OG_WIDTH,
    height: OG_HEIGHT,
    title: post.title,
    description: post.description,
    tags: post.tags,
    siteUrl: 'kellenbusby.com',
    fontBase64,
    hasHeroImage: !!post.heroImagePath,
  })

  let outputImage

  // If hero image exists, composite it with the text overlay
  if (post.heroImagePath && await fileExists(post.heroImagePath)) {
    // Prepare hero image: resize to cover, then crop to exact dimensions
    const heroImage = await sharp(post.heroImagePath)
      .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'center' })
      .toBuffer()

    // Create dark overlay for text readability
    const overlay = Buffer.from(`<svg width="${OG_WIDTH}" height="${OG_HEIGHT}">
      <defs>
        <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${COLORS.background};stop-opacity:0.7" />
          <stop offset="50%" style="stop-color:${COLORS.background};stop-opacity:0.85" />
          <stop offset="100%" style="stop-color:${COLORS.background};stop-opacity:0.7" />
        </linearGradient>
      </defs>
      <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#overlay)"/>
    </svg>`)

    outputImage = sharp(heroImage)
      .composite([
        { input: overlay, blend: 'over' },
        { input: Buffer.from(svg), blend: 'over' },
      ])
  } else {
    outputImage = sharp(Buffer.from(svg))
  }

  await outputImage.png().toFile(outputPath)

  console.log(`  Created OG image: ${outputPath}`)
}

async function generateInstagramImage(post, force = false) {
  const outputPath = join(INSTAGRAM_OUTPUT_DIR, `${post.slug}.png`)

  if (!force && await fileExists(outputPath)) {
    console.log(`  Skipping Instagram image (exists): ${post.slug}`)
    return
  }

  const fontBase64 = await getFontBase64()

  const svg = createInstagramSvg({
    width: INSTAGRAM_WIDTH,
    height: INSTAGRAM_HEIGHT,
    title: post.title,
    siteUrl: 'kellenbusby.com',
    fontBase64,
    hasHeroImage: !!post.heroImagePath,
  })

  let outputImage

  // If hero image exists, composite it with the text overlay
  if (post.heroImagePath && await fileExists(post.heroImagePath)) {
    // Prepare hero image: resize to cover, then crop to exact dimensions
    const heroImage = await sharp(post.heroImagePath)
      .resize(INSTAGRAM_WIDTH, INSTAGRAM_HEIGHT, { fit: 'cover', position: 'center' })
      .toBuffer()

    // Create dark overlay for text readability
    const overlay = Buffer.from(`<svg width="${INSTAGRAM_WIDTH}" height="${INSTAGRAM_HEIGHT}">
      <defs>
        <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${COLORS.background};stop-opacity:0.6" />
          <stop offset="40%" style="stop-color:${COLORS.background};stop-opacity:0.8" />
          <stop offset="60%" style="stop-color:${COLORS.background};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${COLORS.background};stop-opacity:0.6" />
        </linearGradient>
      </defs>
      <rect width="${INSTAGRAM_WIDTH}" height="${INSTAGRAM_HEIGHT}" fill="url(#overlay)"/>
    </svg>`)

    outputImage = sharp(heroImage)
      .composite([
        { input: overlay, blend: 'over' },
        { input: Buffer.from(svg), blend: 'over' },
      ])
  } else {
    outputImage = sharp(Buffer.from(svg))
  }

  await outputImage.png().toFile(outputPath)

  console.log(`  Created Instagram image: ${outputPath}`)
}

async function processPost(post, options) {
  console.log(`\nProcessing: ${post.slug}`)
  console.log(`  Title: ${post.title}`)

  if (!options['instagram-only']) {
    await generateOgImage(post, options.force)
  }

  if (!options['og-only']) {
    await generateInstagramImage(post, options.force)
  }
}

async function main() {
  if (values.help) {
    showHelp()
    return
  }

  // Ensure output directories exist
  await mkdir(OG_OUTPUT_DIR, { recursive: true })
  await mkdir(INSTAGRAM_OUTPUT_DIR, { recursive: true })

  let posts = []

  if (values.all) {
    posts = await getAllPosts()
    if (posts.length === 0) {
      console.error('No blog posts found')
      process.exit(1)
    }
    console.log(`Found ${posts.length} blog posts`)
  } else if (positionals.length > 0) {
    const slug = positionals[0]
    const post = await getPost(slug)
    if (!post) {
      console.error(`Blog post not found: ${slug}`)
      process.exit(1)
    }
    posts = [post]
  } else {
    showHelp()
    process.exit(1)
  }

  for (const post of posts) {
    await processPost(post, values)
  }

  console.log('\nDone!')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
