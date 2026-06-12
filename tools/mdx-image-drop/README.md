# MDX Image Drop

Local VS Code extension for kellenbusby.com. Hold **Shift** and drag an image or video file (from the editor's Explorer pane or from Finder) into an open `.mdx` blog post, dropping it where you want it inserted.

What it does on drop:

- Inserts `<BlogImage src={photoName} alt="…" />` at the drop point (default for a single image), with the alt text pre-selected as a snippet placeholder so you can type over it.
- Adds `import photoName from './images/photo-name.webp'` to the image-import block (after the last existing image import, or after the `{/* --- Image imports below --- */}` marker). Reuses the existing import if the photo is already imported.
- Adds the `import BlogImage from '@components/BlogImage.astro'` line if the post doesn't have it yet.
- If the file came from outside the post folder (e.g. Finder), copies it into the post's `images/` directory first, kebab-casing the filename.
- Dropping **multiple images at once** defaults to `<ImageRow images={[a, b]} alts={[...]} />` (chunked into rows of 2–3 for 4+ images).
- Dropping a **video** (`.mp4`, `.webm`, `.mov`) inserts `<BlogVideo src={clipName} caption="…" />`. If a sibling `clip-name-poster.webp` exists (as written by `pnpm process-videos`), it adds the `poster` import (with `?url`) and prop; if `ffprobe` is available, vertical clips get the `portrait` flag automatically. Mixed image+video drops insert a stacked sequence of both components.

After the drop, a widget appears at the insertion point (or press `Cmd+.`) to switch the inserted form: **BlogImage**, **ImageRow**, **`<img>` tag**, or **markdown image** (images only).

## Post Images pane

A thumbnail browser in the activity bar (image icon) for dragging photos into the post you're writing:

- **Follows the active post**: opening a blog `.mdx` file shows its `images/` folder as a thumbnail grid. Use the folder button in the pane's title bar to pin any other directory, and the eye button to go back to following the active post.
- **Drag to insert**: drag a tile into the editor (hold **Shift** while dropping, same as Finder drags) and it goes through the same drop handler — BlogImage, imports, the lot.
- **Multi-select**: `Cmd`-click toggles, `Shift`-click selects a range, `Esc` clears. Dragging a selection of 2+ images defaults to an `ImageRow`, inserted **in the order you clicked them**.
- **Used badges**: photos already imported by the post are dimmed with a ✓, so you can see what's left to place. Updates live as you edit.
- Videos show their `-poster.webp` frame as the thumbnail with a ▶ overlay (the poster file itself is hidden from the grid).
- **Preview**: press **Space** to open the selected photo in a lightbox tab inside the editor group (works in fullscreen, unlike Quick Look) — arrow keys flip through the whole folder, and **Space or Esc closes it**, dropping you back on the post. While it's open, moving the grid selection updates the lightbox live, Finder-style. Double-click opens the file in VS Code's media preview tab instead. Arrow keys also move the selection around the grid itself.
- The grid renders small cached thumbnails (generated with `sips` into the extension's global storage), so big originals never slow it down; the slider in the pane header resizes the tiles.

## Install / update

```sh
cd tools/mdx-image-drop
npx -y @vscode/vsce package --allow-missing-repository
code-insiders --install-extension mdx-image-drop-0.4.1.vsix
```

Then reload the window (`Cmd+Shift+P` → "Reload Window").
