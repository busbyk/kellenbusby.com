#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createInterface } from 'node:readline'

const BLOG_DIR = 'src/content/blog'

function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function generateTemplate(title) {
  return `---
title: '${title.replace(/'/g, "''")}'
description: ''
pubDate: ${getToday()}
tags: []
# heroImage: ./images/hero.jpg
# heroImageAlt: ''
---

`
}

async function prompt(question) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function main() {
  let title = process.argv.slice(2).join(' ')

  if (!title) {
    title = await prompt('Post title: ')
  }

  if (!title) {
    console.error('No title provided')
    process.exit(1)
  }

  const slug = toSlug(title)
  const postDir = join(BLOG_DIR, slug)
  const imagesDir = join(postDir, 'images')
  const filePath = join(postDir, 'index.mdx')

  await mkdir(imagesDir, { recursive: true })
  await writeFile(filePath, generateTemplate(title))

  console.log(`Created: ${filePath}`)
}

main().catch(console.error)
