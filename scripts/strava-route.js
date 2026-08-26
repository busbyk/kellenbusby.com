#!/usr/bin/env node

// Converts a pasted Strava embed in a post into a native <RouteMap> block.
//
// Usage: pnpm strava-route <slug> [gpx-filename]
//
// Workflow:
//   1. Paste the Strava embed code (Share → Embed) into the post's index.mdx
//   2. Download the activity's GPX (activity page → ⋯ → Export GPX) and drop
//      it in the post's folder, e.g. src/content/blog/<slug>/route.gpx
//   3. Run this script — it fetches title/date/stats/kudos from Strava's
//      embed endpoint (using the embed's own token, no OAuth needed) and
//      replaces the placeholder + embed.js script with a <RouteMap> call
//      wired to the GPX file.
//
// The component is generic: posts without a Strava activity can hand-write a
// <RouteMap> block pointing at any GPX file and skip this script entirely.

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const BLOG_DIR = 'src/content/blog'

function fail(msg) {
  console.error(`✗ ${msg}`)
  process.exit(1)
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function toCamel(filename) {
  return filename
    .replace(/\.gpx$/i, '')
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^[^a-zA-Z_$]+/, '')
}

const [slug, gpxArg] = process.argv.slice(2)
if (!slug) fail('Usage: pnpm strava-route <slug> [gpx-filename]')

const postDir = join(BLOG_DIR, slug)
const mdxPath = join(postDir, 'index.mdx')
let mdx
try {
  mdx = await readFile(mdxPath, 'utf8')
} catch {
  fail(`No post found at ${mdxPath}`)
}

// --- locate the pasted embed ---------------------------------------------
const placeholderMatch = mdx.match(
  /<div\s+class="strava-embed-placeholder"[\s\S]*?><\/div>\s*\n?(?:<script src="https:\/\/strava-embeds\.com\/embed\.js"><\/script>\s*\n?)?/,
)
if (!placeholderMatch) {
  fail(
    `No strava-embed-placeholder found in ${mdxPath}.\n` +
      '  Paste the embed code from Strava (Share → Embed) into the post first.',
  )
}
const embedId = placeholderMatch[0].match(/data-embed-id="(\d+)"/)?.[1]
const token = placeholderMatch[0].match(/data-token="([^"]+)"/)?.[1]
if (!embedId || !token)
  fail('Embed placeholder is missing data-embed-id or data-token.')

// --- locate the GPX file ---------------------------------------------------
const gpxFiles = (await readdir(postDir)).filter((f) => /\.gpx$/i.test(f))
let gpxFile = gpxArg
if (!gpxFile) {
  if (gpxFiles.length === 0) {
    fail(
      `No .gpx file in ${postDir}.\n` +
        `  Download it from https://www.strava.com/activities/${embedId}\n` +
        '  (⋯ menu → Export GPX), drop it in the post folder, and re-run.',
    )
  }
  if (gpxFiles.length > 1) {
    fail(
      `Multiple .gpx files in ${postDir} (${gpxFiles.join(', ')}).\n` +
        '  Re-run with the one to use: pnpm strava-route <slug> <gpx-filename>',
    )
  }
  gpxFile = gpxFiles[0]
} else if (!gpxFiles.includes(gpxFile)) {
  fail(`${gpxFile} not found in ${postDir}`)
}

const gpxContent = await readFile(join(postDir, gpxFile), 'utf8')
if (/PLACEHOLDER/i.test(gpxContent.slice(0, 300))) {
  console.warn(
    `⚠ ${gpxFile} looks like a placeholder track — replace it with the real export before publishing.`,
  )
}

// --- fetch activity data from the embed endpoint --------------------------
const embedUrl = `https://strava-embeds.com/activity/${embedId}?token=${token}`
const res = await fetch(embedUrl)
if (!res.ok)
  fail(`Strava embed endpoint returned ${res.status} for ${embedUrl}`)
const html = await res.text()
if (html.includes('embed-error')) {
  fail(
    'Strava returned an error embed — the data-token may be wrong or revoked.',
  )
}

const title = decodeEntities(
  html.match(/<h1 class="activity-name">([^<]*)<\/h1>/)?.[1] ?? '',
)
const date = html.match(/<div class="activity-date">([^<]*)<\/div>/)?.[1] ?? ''
const kudos = html.match(/(\d+) kudos/)?.[1]
const stats = [
  ...html.matchAll(
    /<div class="stat-label">([^<]*)<\/div><div class="stat-value">([^<]*)<\/div>/g,
  ),
].map((m) => ({ label: m[1], value: m[2] }))
if (!title)
  fail(
    'Could not parse the activity title — Strava may have changed their embed markup.',
  )

// --- build the replacement block -------------------------------------------
const varBase = toCamel(gpxFile)
const statsJsx = stats
  .map((s) => `    { label: '${s.label}', value: '${s.value}' },`)
  .join('\n')

const routeMapBlock = `<RouteMap
  title={${JSON.stringify(title)}}
  date="${date}"
  gpx={${varBase}Gpx}
  gpxUrl={${varBase}GpxUrl}
  gpxFilename="${gpxFile}"
  stravaUrl="https://www.strava.com/activities/${embedId}"
  embedToken="${token}"
${kudos ? `  kudos={${kudos}}\n` : ''}  stats={[
${statsJsx}
  ]}
/>
`

const imports = [
  `import RouteMap from '@components/RouteMap.astro'`,
  `import ${varBase}Gpx from './${gpxFile}?raw'`,
  `import ${varBase}GpxUrl from './${gpxFile}?url'`,
].filter((line) => !mdx.includes(line))

// the placeholder regex may swallow the blank line separating it from the
// next markdown block — re-pad, then collapse any double padding
let updated = mdx
  .replace(placeholderMatch[0], routeMapBlock + '\n')
  .replace(/\n{3,}/g, '\n\n')
if (imports.length > 0) {
  const importLines = [...updated.matchAll(/^import .*$/gm)]
  if (importLines.length === 0)
    fail('No import block found in the MDX to extend.')
  const last = importLines[importLines.length - 1]
  const insertAt = last.index + last[0].length
  updated =
    updated.slice(0, insertAt) +
    '\n' +
    imports.join('\n') +
    updated.slice(insertAt)
}

await writeFile(mdxPath, updated)
console.log(`✓ ${mdxPath}`)
console.log(`  title: ${title} (${date})`)
console.log(
  `  stats: ${stats.map((s) => `${s.label} ${s.value}`).join(' · ')}${kudos ? ` · ${kudos} kudos` : ''}`,
)
console.log(`  gpx:   ${gpxFile}`)
