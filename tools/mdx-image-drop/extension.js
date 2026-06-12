const vscode = require('vscode')
const path = require('path')
const { execFile } = require('child_process')

const IMAGE_EXTS = new Set(['.webp', '.jpg', '.jpeg', '.png', '.gif', '.avif'])
const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov'])
const IMAGE_IMPORT_MARKER = '{/* --- Image imports below --- */}'

// GUI-launched VS Code may not have homebrew on PATH
const FFPROBE_CANDIDATES = ['ffprobe', '/opt/homebrew/bin/ffprobe', '/usr/local/bin/ffprobe']

/** Display dimensions of a video (rotation-aware), or null if ffprobe is unavailable. */
function probeVideoDims(file) {
  return new Promise((resolve) => {
    const tryNext = (i) => {
      if (i >= FFPROBE_CANDIDATES.length) return resolve(null)
      const args = [
        '-v', 'error',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height:stream_side_data=rotation',
        '-of', 'json',
        file,
      ]
      execFile(FFPROBE_CANDIDATES[i], args, (err, stdout) => {
        if (err) return err.code === 'ENOENT' ? tryNext(i + 1) : resolve(null)
        try {
          const s = JSON.parse(stdout).streams?.[0]
          if (!s || !s.width || !s.height) return resolve(null)
          const rotation = s.side_data_list?.find((d) => d.rotation != null)?.rotation ?? 0
          const swapped = Math.abs(rotation) % 180 === 90
          resolve(swapped ? { width: s.height, height: s.width } : { width: s.width, height: s.height })
        } catch {
          resolve(null)
        }
      })
    }
    tryNext(0)
  })
}

function kebabFileName(fileName) {
  const ext = path.extname(fileName).toLowerCase()
  const base = path
    .basename(fileName, path.extname(fileName))
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return (base || 'image') + ext
}

function camelCaseName(fileName) {
  const base = path.basename(fileName, path.extname(fileName))
  const words = base.split(/[^a-zA-Z0-9]+/).filter(Boolean)
  let name = words
    .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join('')
  if (!name || /^\d/.test(name)) name = 'img' + (name ? name[0].toUpperCase() + name.slice(1) : '')
  return name
}

function altGuess(fileName) {
  return path
    .basename(fileName, path.extname(fileName))
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function fileExists(uri) {
  try {
    await vscode.workspace.fs.stat(uri)
    return true
  } catch {
    return false
  }
}

/**
 * Parse existing `import name from './relative/path'` statements.
 * Returns { byPath: Map<importPath, name>, usedNames: Set<name>, lastImportLine, lastImageImportLine, markerLine, frontmatterEndLine, lastComponentImportLine }
 */
function scanDocument(document) {
  const byPath = new Map()
  const usedNames = new Set()
  let lastImportLine = -1
  let lastImageImportLine = -1
  let lastComponentImportLine = -1
  let markerLine = -1
  let frontmatterEndLine = -1

  let fenceCount = 0
  for (let i = 0; i < document.lineCount; i++) {
    const text = document.lineAt(i).text
    if (fenceCount < 2 && /^---\s*$/.test(text)) {
      fenceCount++
      if (fenceCount === 2) frontmatterEndLine = i
      continue
    }
    if (text.includes(IMAGE_IMPORT_MARKER)) markerLine = i
    const m = text.match(/^import\s+([A-Za-z_$][\w$]*)\s+from\s+['"]([^'"]+)['"]/)
    if (m) {
      const [, name, importPath] = m
      byPath.set(importPath, name)
      usedNames.add(name)
      lastImportLine = i
      if (/^\.\.?\/.*\.(webp|jpe?g|png|gif|avif|mp4|webm|mov)(\?url)?$/i.test(importPath)) lastImageImportLine = i
      if (importPath.startsWith('@components/')) lastComponentImportLine = i
    }
  }
  return { byPath, usedNames, lastImportLine, lastImageImportLine, lastComponentImportLine, markerLine, frontmatterEndLine }
}

function uniqueName(base, usedNames) {
  let name = base
  let n = 2
  while (usedNames.has(name)) name = base + n++
  usedNames.add(name)
  return name
}

/** Split n items into row chunks of 2–3 for ImageRow (which accepts exactly 2 or 3 images). */
function chunkForRows(n) {
  const chunks = []
  let remaining = n
  while (remaining > 0) {
    if (remaining === 4) {
      chunks.push(2, 2)
      remaining = 0
    } else if (remaining >= 3) {
      chunks.push(3)
      remaining -= 3
    } else {
      chunks.push(remaining)
      remaining = 0
    }
  }
  return chunks
}

class MdxImageDropProvider {
  constructor(baseKind) {
    this.baseKind = baseKind
  }

  async provideDocumentDropEdits(document, _position, dataTransfer, token) {
    const uriListItem = dataTransfer.get('text/uri-list')
    if (!uriListItem) return
    const raw = await uriListItem.asString()
    if (token.isCancellationRequested) return

    const droppedUris = raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('#'))
      .flatMap((s) => {
        try {
          return [vscode.Uri.parse(s)]
        } catch {
          return []
        }
      })
      .filter((u) => {
        const ext = path.extname(u.fsPath).toLowerCase()
        return u.scheme === 'file' && (IMAGE_EXTS.has(ext) || VIDEO_EXTS.has(ext))
      })
    if (droppedUris.length === 0) return

    const postDir = path.dirname(document.uri.fsPath)
    const imagesDir = vscode.Uri.file(path.join(postDir, 'images'))
    const scan = scanDocument(document)

    // Resolve each dropped file to a post-relative path, copying external files into ./images/
    const items = []
    for (const uri of droppedUris) {
      let relPath
      let fsPath
      if (uri.fsPath.startsWith(postDir + path.sep)) {
        fsPath = uri.fsPath
        relPath = './' + path.relative(postDir, uri.fsPath).split(path.sep).join('/')
      } else {
        await vscode.workspace.fs.createDirectory(imagesDir)
        let targetName = kebabFileName(path.basename(uri.fsPath))
        let target = vscode.Uri.joinPath(imagesDir, targetName)
        let n = 2
        while (await fileExists(target)) {
          const ext = path.extname(targetName)
          targetName = path.basename(kebabFileName(path.basename(uri.fsPath)), ext) + '-' + n++ + ext
          target = vscode.Uri.joinPath(imagesDir, targetName)
        }
        await vscode.workspace.fs.copy(uri, target)
        fsPath = target.fsPath
        relPath = './images/' + targetName
      }

      const kind = VIDEO_EXTS.has(path.extname(fsPath).toLowerCase()) ? 'video' : 'image'
      const existingName = scan.byPath.get(relPath)
      const item = {
        kind,
        relPath,
        name: existingName ?? uniqueName(camelCaseName(relPath), scan.usedNames),
        needsImport: !existingName,
        alt: altGuess(relPath),
      }

      if (kind === 'video') {
        // process-videos writes a sibling <name>-poster.webp; import it as a URL if present
        const base = path.basename(fsPath, path.extname(fsPath))
        const posterFsPath = path.join(path.dirname(fsPath), base + '-poster.webp')
        if (await fileExists(vscode.Uri.file(posterFsPath))) {
          // keep relPath's './' prefix — path.posix.join would normalize it away,
          // breaking both import-reuse matching and the relative import itself
          const posterRelPath = relPath.slice(0, relPath.lastIndexOf('/') + 1) + base + '-poster.webp?url'
          const existingPoster = scan.byPath.get(posterRelPath)
          item.posterRelPath = posterRelPath
          item.posterName = existingPoster ?? uniqueName(item.name + 'Poster', scan.usedNames)
          item.needsPosterImport = !existingPoster
        }
        const dims = await probeVideoDims(fsPath)
        item.portrait = !!dims && dims.height > dims.width
      }

      items.push(item)
    }

    const allImages = items.every((item) => item.kind === 'image')
    const edits = []
    if (allImages && items.length >= 2) edits.push(this.imageRowEdit(document, items, scan))
    edits.push(this.stackedEdit(document, items, scan))
    if (allImages) {
      edits.push(this.imgTagEdit(document, items, scan))
      edits.push(this.markdownEdit(items))
    }
    return edits
  }

  /** WorkspaceEdit that adds missing media imports (and component imports if needed). */
  buildImports(document, items, scan, componentNames) {
    const edit = new vscode.WorkspaceEdit()

    const importLines = []
    for (const item of items) {
      if (item.needsImport) importLines.push(`import ${item.name} from '${item.relPath}'`)
      if (item.needsPosterImport) importLines.push(`import ${item.posterName} from '${item.posterRelPath}'`)
    }
    if (importLines.length > 0) {
      const afterLine =
        scan.lastImageImportLine >= 0
          ? scan.lastImageImportLine
          : scan.markerLine >= 0
            ? scan.markerLine
            : scan.lastImportLine >= 0
              ? scan.lastImportLine
              : scan.frontmatterEndLine
      const insertAt = new vscode.Position(afterLine + 1, 0)
      const blankBefore = scan.lastImageImportLine < 0 && scan.markerLine < 0 ? '\n' : ''
      edit.insert(document.uri, insertAt, blankBefore + importLines.join('\n') + '\n')
    }

    const missingComponents = (componentNames ?? []).filter((name) => !scan.usedNames.has(name))
    if (missingComponents.length > 0) {
      const afterLine =
        scan.lastComponentImportLine >= 0 ? scan.lastComponentImportLine : scan.frontmatterEndLine
      const insertAt = new vscode.Position(afterLine + 1, 0)
      const blankBefore = scan.lastComponentImportLine < 0 ? '\n' : ''
      const lines = missingComponents.map((name) => `import ${name} from '@components/${name}.astro'`)
      edit.insert(document.uri, insertAt, blankBefore + lines.join('\n') + '\n')
    }
    return edit
  }

  stackedEdit(document, items, scan) {
    const snippet = new vscode.SnippetString()
    items.forEach((item, i) => {
      if (i > 0) snippet.appendText('\n\n')
      if (item.kind === 'video') {
        snippet.appendText(`<BlogVideo src={${item.name}}`)
        if (item.posterName) snippet.appendText(` poster={${item.posterName}}`)
        if (item.portrait) snippet.appendText(' portrait')
        snippet.appendText(' caption="')
        snippet.appendPlaceholder(item.alt)
        snippet.appendText('" />')
      } else {
        snippet.appendText(`<BlogImage src={${item.name}} alt="`)
        snippet.appendPlaceholder(item.alt)
        snippet.appendText('" />')
      }
    })

    const components = [...new Set(items.map((item) => (item.kind === 'video' ? 'BlogVideo' : 'BlogImage')))]
    const title =
      components.length > 1
        ? 'Insert as BlogImage + BlogVideo'
        : `Insert as ${components[0]}${items.length > 1 ? ' (stacked)' : ''}`
    const edit = new vscode.DocumentDropEdit(snippet, title, this.baseKind.append('blogImage'))
    edit.additionalEdit = this.buildImports(document, items, scan, components)
    return edit
  }

  imageRowEdit(document, images, scan) {
    const snippet = new vscode.SnippetString()
    let offset = 0
    chunkForRows(images.length).forEach((size, rowIdx) => {
      const row = images.slice(offset, offset + size)
      offset += size
      if (rowIdx > 0) snippet.appendText('\n\n')
      snippet.appendText('<ImageRow\n  images={[' + row.map((img) => img.name).join(', ') + ']}\n  alts={[')
      row.forEach((img, i) => {
        if (i > 0) snippet.appendText(', ')
        snippet.appendText("'")
        snippet.appendPlaceholder(img.alt)
        snippet.appendText("'")
      })
      snippet.appendText(']}\n/>')
    })
    const edit = new vscode.DocumentDropEdit(snippet, 'Insert as ImageRow', this.baseKind.append('imageRow'))
    edit.additionalEdit = this.buildImports(document, images, scan, ['ImageRow'])
    return edit
  }

  imgTagEdit(document, images, scan) {
    const snippet = new vscode.SnippetString()
    images.forEach((img, i) => {
      if (i > 0) snippet.appendText('\n')
      snippet.appendText(`<img src={${img.name}.src} alt="`)
      snippet.appendPlaceholder(img.alt)
      snippet.appendText('" />')
    })
    const edit = new vscode.DocumentDropEdit(snippet, 'Insert as <img> tag', this.baseKind.append('imgTag'))
    edit.additionalEdit = this.buildImports(document, images, scan, [])
    return edit
  }

  markdownEdit(images) {
    const snippet = new vscode.SnippetString()
    images.forEach((img, i) => {
      if (i > 0) snippet.appendText('\n\n')
      snippet.appendText('![')
      snippet.appendPlaceholder(img.alt)
      snippet.appendText(`](${img.relPath})`)
    })
    return new vscode.DocumentDropEdit(snippet, 'Insert as markdown image', this.baseKind.append('markdown'))
  }
}

function activate(context) {
  const baseKind = vscode.DocumentDropOrPasteEditKind.Empty.append('mdx', 'image')
  context.subscriptions.push(
    vscode.languages.registerDocumentDropEditProvider({ pattern: '**/*.mdx' }, new MdxImageDropProvider(baseKind), {
      providedDropEditKinds: [baseKind],
      dropMimeTypes: ['text/uri-list'],
    })
  )
}

function deactivate() {}

module.exports = { activate, deactivate }
