const vscode = require('vscode')
const path = require('path')
const crypto = require('crypto')
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

const POSTER_SUFFIX = '-poster.webp'

/**
 * Sidebar webview showing thumbnails of the active post's images/ folder.
 * Tiles are draggable and put `text/uri-list` on the drag, so dropping into
 * an .mdx editor goes through MdxImageDropProvider like any other file drag.
 */
class PostImagesViewProvider {
  static viewType = 'mdxImageDrop.postImages'

  constructor(context) {
    this.view = null
    this.folder = null
    this.pinned = false
    this.activeMdx = null
    this.watcher = null
    this.refreshTimer = null
    this.thumbsDir = vscode.Uri.joinPath(context.globalStorageUri, 'thumbs')
    this.lastItems = []
    this.previewPanel = null
    this.previewFolder = null
  }

  dispose() {
    this.watcher?.dispose()
    this.previewPanel?.dispose()
    clearTimeout(this.refreshTimer)
  }

  resolveWebviewView(webviewView) {
    this.view = webviewView
    this.applyWebviewOptions()
    webviewView.webview.html = buildPostImagesHtml(webviewView.webview)
    webviewView.webview.onDidReceiveMessage((msg) => {
      if (msg.type === 'ready') this.refresh()
      else if (msg.type === 'open' && msg.uri) {
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(msg.uri))
      } else if (msg.type === 'preview') {
        // space toggles, like Quick Look
        if (this.previewPanel?.visible) this.previewPanel.dispose()
        else this.openPreview(msg.index ?? 0)
      } else if (msg.type === 'follow') {
        // grid selection moved while the lightbox is open — track it without stealing focus
        if (this.previewPanel) this.sendPreview(msg.index ?? 0)
      }
    })
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) this.refresh()
    })
    this.followActiveEditor(vscode.window.activeTextEditor)
    this.updateDescription()
  }

  applyWebviewOptions() {
    if (!this.view) return
    const roots = (vscode.workspace.workspaceFolders ?? []).map((f) => f.uri)
    if (this.folder) roots.push(this.folder)
    roots.push(this.thumbsDir)
    this.view.webview.options = { enableScripts: true, localResourceRoots: roots }
  }

  followActiveEditor(editor) {
    const doc = editor?.document
    if (!doc || doc.uri.scheme !== 'file' || !doc.uri.fsPath.toLowerCase().endsWith('.mdx')) return
    this.activeMdx = doc
    if (this.pinned) return this.scheduleRefresh()
    this.setFolder(vscode.Uri.file(path.join(path.dirname(doc.uri.fsPath), 'images')))
  }

  setFolder(uri) {
    if (this.folder?.fsPath === uri.fsPath) return this.scheduleRefresh()
    this.folder = uri
    this.watcher?.dispose()
    this.watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(uri, '*'))
    this.watcher.onDidCreate(() => this.scheduleRefresh())
    this.watcher.onDidDelete(() => this.scheduleRefresh())
    this.watcher.onDidChange(() => this.scheduleRefresh())
    this.applyWebviewOptions()
    this.updateDescription()
    this.scheduleRefresh()
  }

  updateDescription() {
    if (!this.view) return
    if (!this.folder) {
      this.view.description = undefined
      return
    }
    // an images/ dir is named after its post; anything else by its own name
    const name = path.basename(this.folder.fsPath)
    this.view.description = name === 'images' ? path.basename(path.dirname(this.folder.fsPath)) : name
  }

  scheduleRefresh() {
    clearTimeout(this.refreshTimer)
    this.refreshTimer = setTimeout(() => this.refresh(), 200)
  }

  onDocumentChanged(document) {
    if (this.activeMdx && document.uri.toString() === this.activeMdx.uri.toString()) this.scheduleRefresh()
  }

  /** Absolute paths of media referenced by the active post (imports + markdown images). */
  usedMediaPaths() {
    const used = new Set()
    if (!this.activeMdx) return used
    const dir = path.dirname(this.activeMdx.uri.fsPath)
    const text = this.activeMdx.getText()
    const patterns = [
      /from\s+['"](\.\.?\/[^'"]+?\.(?:webp|jpe?g|png|gif|avif|mp4|webm|mov))(?:\?url)?['"]/gi,
      /\]\((\.\.?\/[^)\s]+?\.(?:webp|jpe?g|png|gif|avif))\)/gi,
    ]
    for (const re of patterns) {
      for (const m of text.matchAll(re)) used.add(path.resolve(dir, m[1]))
    }
    return used
  }

  async refresh() {
    if (!this.view) return
    let entries = []
    if (this.folder) {
      try {
        entries = await vscode.workspace.fs.readDirectory(this.folder)
      } catch {
        entries = []
      }
    }
    const names = new Set(
      entries.filter(([, type]) => type === vscode.FileType.File).map(([name]) => name)
    )
    const used = this.usedMediaPaths()
    const media = []
    for (const name of [...names].sort()) {
      const ext = path.extname(name).toLowerCase()
      const isVideo = VIDEO_EXTS.has(ext)
      if (!isVideo && !IMAGE_EXTS.has(ext)) continue
      // hide poster images whose video is already a tile (the poster becomes its thumbnail)
      if (name.endsWith(POSTER_SUFFIX)) {
        const base = name.slice(0, -POSTER_SUFFIX.length)
        if ([...VIDEO_EXTS].some((v) => names.has(base + v))) continue
      }
      const fileUri = vscode.Uri.joinPath(this.folder, name)
      let posterUri = null
      let thumbSource = fileUri
      if (isVideo) {
        const posterName = path.basename(name, ext) + POSTER_SUFFIX
        posterUri = names.has(posterName) ? vscode.Uri.joinPath(this.folder, posterName) : null
        thumbSource = posterUri
      }
      media.push({ name, fileUri, posterUri, thumbSource, isVideo, used: used.has(fileUri.fsPath) })
    }

    // grid uses small cached thumbnails so it never decodes the full-size originals
    try {
      await vscode.workspace.fs.createDirectory(this.thumbsDir)
    } catch {
      /* exists */
    }
    await mapLimit(media, 6, async (m) => {
      m.thumbUri = m.thumbSource ? await this.ensureThumb(m.thumbSource) : null
    })

    this.lastItems = media
    if (!this.view) return
    this.view.webview.postMessage({
      type: 'setItems',
      hasFolder: !!this.folder,
      folderLabel: this.folder ? path.basename(this.folder.fsPath) : null,
      items: media.map((m) => ({
        name: m.name,
        uri: m.fileUri.toString(),
        thumb: m.thumbUri ? this.view.webview.asWebviewUri(m.thumbUri).toString() : null,
        isVideo: m.isVideo,
        used: m.used,
      })),
    })
  }

  /** Cached ≤480px JPEG thumbnail generated with sips; falls back to the original file. */
  async ensureThumb(fileUri) {
    try {
      const stat = await vscode.workspace.fs.stat(fileUri)
      const key = crypto
        .createHash('md5')
        .update(`${fileUri.fsPath}:${stat.mtime}:${stat.size}`)
        .digest('hex')
      const thumbUri = vscode.Uri.joinPath(this.thumbsDir, key + '.jpg')
      if (await fileExists(thumbUri)) return thumbUri
      await new Promise((resolve) => {
        execFile(
          'sips',
          ['-Z', '480', '-s', 'format', 'jpeg', fileUri.fsPath, '--out', thumbUri.fsPath],
          () => resolve()
        )
      })
      return (await fileExists(thumbUri)) ? thumbUri : fileUri
    } catch {
      return fileUri
    }
  }

  /** Lightbox tab in the active editor group — stays inside the window, so fullscreen works. */
  openPreview(index) {
    if (!this.folder || this.lastItems.length === 0) return
    if (this.previewPanel && this.previewFolder !== this.folder.fsPath) {
      this.previewPanel.dispose()
    }
    if (!this.previewPanel) {
      const roots = (vscode.workspace.workspaceFolders ?? []).map((f) => f.uri)
      roots.push(this.folder)
      this.previewPanel = vscode.window.createWebviewPanel(
        'mdxImageDrop.preview',
        'Post Images',
        vscode.ViewColumn.Active,
        { enableScripts: true, localResourceRoots: roots, retainContextWhenHidden: true }
      )
      this.previewFolder = this.folder.fsPath
      this.previewPanel.webview.html = buildPreviewHtml(this.previewPanel.webview)
      this.previewPanel.webview.onDidReceiveMessage((msg) => {
        if (msg.type === 'close') this.previewPanel?.dispose()
        else if (msg.type === 'title' && this.previewPanel) this.previewPanel.title = msg.title
      })
      this.previewPanel.onDidDispose(() => {
        this.previewPanel = null
      })
    } else {
      this.previewPanel.reveal(vscode.ViewColumn.Active)
    }
    this.sendPreview(index)
  }

  sendPreview(index) {
    if (!this.previewPanel) return
    const webview = this.previewPanel.webview
    webview.postMessage({
      type: 'show',
      index: Math.max(0, Math.min(index, this.lastItems.length - 1)),
      items: this.lastItems.map((m) => ({
        name: m.name,
        src: webview.asWebviewUri(m.fileUri).toString(),
        poster: m.posterUri ? webview.asWebviewUri(m.posterUri).toString() : null,
        isVideo: m.isVideo,
      })),
    })
  }
}

/** Run fn over items with at most `limit` in flight. */
async function mapLimit(items, limit, fn) {
  let i = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) await fn(items[i++])
    })
  )
}

function buildPreviewHtml(webview) {
  const nonce = Array.from({ length: 24 }, () => Math.floor(Math.random() * 36).toString(36)).join('')
  return `<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; media-src ${webview.cspSource}; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
<style>
  html, body { height: 100%; margin: 0; }
  body { display: flex; flex-direction: column; background: #101010; color: #ddd; font-family: var(--vscode-font-family); font-size: 12px; }
  .stage { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; }
  .stage img, .stage video { max-width: 100%; max-height: 100%; object-fit: contain; }
  .caption { padding: 8px 12px; text-align: center; opacity: 0.8; user-select: none; }
</style>
</head>
<body>
<div class="stage" id="stage"></div>
<div class="caption" id="caption"></div>
<script nonce="${nonce}">
  const vscodeApi = acquireVsCodeApi()
  let items = []
  let index = 0

  window.addEventListener('message', (e) => {
    if (e.data.type !== 'show') return
    items = e.data.items
    index = e.data.index
    render()
  })

  function render() {
    const item = items[index]
    if (!item) return
    const stage = document.getElementById('stage')
    stage.textContent = ''
    if (item.isVideo) {
      const video = document.createElement('video')
      video.controls = true
      video.autoplay = true
      if (item.poster) video.poster = item.poster
      video.src = item.src
      stage.appendChild(video)
    } else {
      const img = document.createElement('img')
      img.src = item.src
      stage.appendChild(img)
    }
    const counter = (index + 1) + ' / ' + items.length
    document.getElementById('caption').textContent = item.name + ' \\u2014 ' + counter
    vscodeApi.postMessage({ type: 'title', title: item.name + ' (' + counter + ')' })
    // warm the neighbors so arrowing feels instant
    for (const n of [index - 1, index + 1]) {
      if (items[n] && !items[n].isVideo) new Image().src = items[n].src
    }
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      index = Math.min(index + 1, items.length - 1)
      render()
      e.preventDefault()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      index = Math.max(index - 1, 0)
      render()
      e.preventDefault()
    } else if (e.key === 'Escape' || (e.key === ' ' && e.target.tagName !== 'VIDEO')) {
      e.preventDefault()
      vscodeApi.postMessage({ type: 'close' })
    }
  })
</script>
</body>
</html>`
}

function buildPostImagesHtml(webview) {
  const nonce = Array.from({ length: 24 }, () => Math.floor(Math.random() * 36).toString(36)).join('')
  return `<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
<style>
  body { padding: 0 8px 8px; color: var(--vscode-foreground); font-family: var(--vscode-font-family); font-size: 11px; user-select: none; }
  .meta { position: sticky; top: 0; z-index: 1; background: var(--vscode-sideBar-background); padding: 6px 0; display: flex; align-items: center; gap: 8px; }
  .meta span { flex: 1; opacity: 0.75; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .meta input[type='range'] { width: 72px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(var(--tile, 92px), 1fr)); gap: 8px; }
  .tile { cursor: grab; border-radius: 6px; padding: 4px; }
  .tile:hover { background: var(--vscode-list-hoverBackground); }
  .tile.selected { background: var(--vscode-list-activeSelectionBackground); color: var(--vscode-list-activeSelectionForeground); }
  .thumb { position: relative; aspect-ratio: 1; border-radius: 4px; overflow: hidden; background: var(--vscode-input-background); display: flex; align-items: center; justify-content: center; }
  .thumb img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
  .tile.used .thumb img { opacity: 0.45; }
  .badge { position: absolute; top: 3px; right: 3px; width: 16px; height: 16px; border-radius: 50%; background: var(--vscode-charts-green, #2da44e); color: #fff; font-size: 11px; line-height: 16px; text-align: center; }
  .play { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 26px; height: 26px; border-radius: 50%; background: rgba(0, 0, 0, 0.55); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; }
  .name { margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center; }
  .empty { padding: 24px 8px; text-align: center; opacity: 0.7; line-height: 1.5; }
</style>
</head>
<body>
<div class="meta"><span id="meta"></span><input id="size" type="range" min="64" max="240" step="4" value="92" title="Thumbnail size"></div>
<div class="grid" id="grid"></div>
<div class="empty" id="empty" hidden></div>
<script nonce="${nonce}">
  const vscodeApi = acquireVsCodeApi()
  let items = []
  let hasFolder = false
  const selected = new Set() // file uris, in click order — drag inserts in this order
  let lastClicked = -1

  window.addEventListener('message', (e) => {
    const msg = e.data
    if (msg.type !== 'setItems') return
    items = msg.items
    hasFolder = msg.hasFolder
    for (const uri of [...selected]) if (!items.some((it) => it.uri === uri)) selected.delete(uri)
    document.getElementById('meta').textContent = msg.folderLabel
      ? msg.folderLabel + '/ — ' + items.length + (items.length === 1 ? ' file' : ' files')
      : ''
    render()
  })

  function render() {
    const grid = document.getElementById('grid')
    const empty = document.getElementById('empty')
    grid.textContent = ''
    if (items.length === 0) {
      empty.hidden = false
      empty.textContent = hasFolder
        ? 'No images in this folder yet.'
        : 'Open a blog post .mdx file to browse its images/ folder.'
      return
    }
    empty.hidden = true
    items.forEach((item, idx) => {
      const tile = document.createElement('div')
      tile.className = 'tile' + (item.used ? ' used' : '') + (selected.has(item.uri) ? ' selected' : '')
      tile.draggable = true
      tile.title = item.name + (item.used ? ' — already in post' : '')

      const thumb = document.createElement('div')
      thumb.className = 'thumb'
      if (item.thumb) {
        const img = document.createElement('img')
        img.loading = 'lazy'
        img.decoding = 'async'
        img.src = item.thumb
        thumb.appendChild(img)
      }
      if (item.isVideo) {
        const play = document.createElement('div')
        play.className = 'play'
        play.textContent = '\\u25B6'
        thumb.appendChild(play)
      }
      if (item.used) {
        const badge = document.createElement('div')
        badge.className = 'badge'
        badge.textContent = '\\u2713'
        thumb.appendChild(badge)
      }
      const name = document.createElement('div')
      name.className = 'name'
      name.textContent = item.name
      tile.appendChild(thumb)
      tile.appendChild(name)

      tile.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey) {
          if (selected.has(item.uri)) selected.delete(item.uri)
          else selected.add(item.uri)
        } else if (e.shiftKey && lastClicked >= 0) {
          const lo = Math.min(lastClicked, idx)
          const hi = Math.max(lastClicked, idx)
          for (let i = lo; i <= hi; i++) selected.add(items[i].uri)
        } else {
          selected.clear()
          selected.add(item.uri)
        }
        lastClicked = idx
        updateSelection()
        vscodeApi.postMessage({ type: 'follow', index: idx })
      })
      tile.addEventListener('dblclick', () => vscodeApi.postMessage({ type: 'open', uri: item.uri }))
      tile.addEventListener('dragstart', (e) => {
        if (!selected.has(item.uri)) {
          selected.clear()
          selected.add(item.uri)
          lastClicked = idx
          updateSelection()
        }
        e.dataTransfer.setData('text/uri-list', [...selected].join('\\r\\n'))
        e.dataTransfer.effectAllowed = 'copy'
      })
      grid.appendChild(tile)
    })
  }

  function updateSelection() {
    const tiles = document.querySelectorAll('.tile')
    tiles.forEach((el, i) => el.classList.toggle('selected', selected.has(items[i].uri)))
  }

  document.body.addEventListener('click', (e) => {
    if (e.target === document.body) {
      selected.clear()
      updateSelection()
    }
  })
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return
    if (e.key === 'Escape') {
      selected.clear()
      updateSelection()
    } else if (e.key === ' ' && items.length > 0) {
      e.preventDefault()
      vscodeApi.postMessage({ type: 'preview', index: lastClicked >= 0 ? lastClicked : 0 })
    } else if (e.key.startsWith('Arrow') && items.length > 0) {
      e.preventDefault()
      const tiles = [...document.querySelectorAll('.tile')]
      const firstTop = tiles[0].offsetTop
      const cols = Math.max(1, tiles.filter((t) => t.offsetTop === firstTop).length)
      const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowDown' ? cols : -cols
      const next = Math.max(0, Math.min(lastClicked < 0 ? 0 : lastClicked + delta, items.length - 1))
      selected.clear()
      selected.add(items[next].uri)
      lastClicked = next
      updateSelection()
      tiles[next].scrollIntoView({ block: 'nearest' })
      vscodeApi.postMessage({ type: 'follow', index: next })
    }
  })

  const sizeInput = document.getElementById('size')
  function applyTile() {
    document.documentElement.style.setProperty('--tile', sizeInput.value + 'px')
  }
  const savedTile = (vscodeApi.getState() || {}).tile
  if (savedTile) sizeInput.value = savedTile
  applyTile()
  sizeInput.addEventListener('input', () => {
    applyTile()
    vscodeApi.setState({ ...(vscodeApi.getState() || {}), tile: sizeInput.value })
  })

  vscodeApi.postMessage({ type: 'ready' })
</script>
</body>
</html>`
}

function activate(context) {
  const baseKind = vscode.DocumentDropOrPasteEditKind.Empty.append('mdx', 'image')
  const postImages = new PostImagesViewProvider(context)
  context.subscriptions.push(
    vscode.languages.registerDocumentDropEditProvider({ pattern: '**/*.mdx' }, new MdxImageDropProvider(baseKind), {
      providedDropEditKinds: [baseKind],
      dropMimeTypes: ['text/uri-list'],
    }),
    vscode.window.registerWebviewViewProvider(PostImagesViewProvider.viewType, postImages, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
    vscode.window.onDidChangeActiveTextEditor((editor) => postImages.followActiveEditor(editor)),
    vscode.workspace.onDidChangeTextDocument((e) => postImages.onDocumentChanged(e.document)),
    vscode.commands.registerCommand('mdx-image-drop.refreshPostImages', () => postImages.refresh()),
    vscode.commands.registerCommand('mdx-image-drop.choosePostImagesFolder', async () => {
      const picked = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: 'Show images',
      })
      if (picked?.[0]) {
        postImages.pinned = true
        postImages.setFolder(picked[0])
      }
    }),
    vscode.commands.registerCommand('mdx-image-drop.followActivePost', () => {
      postImages.pinned = false
      postImages.followActiveEditor(vscode.window.activeTextEditor)
    }),
    postImages
  )
}

function deactivate() {}

module.exports = { activate, deactivate }
