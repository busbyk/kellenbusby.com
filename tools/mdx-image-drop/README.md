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

## Install / update

```sh
cd tools/mdx-image-drop
npx -y @vscode/vsce package --allow-missing-repository
code-insiders --install-extension mdx-image-drop-0.2.0.vsix
```

Then reload the window (`Cmd+Shift+P` → "Reload Window").
