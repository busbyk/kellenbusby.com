---
name: rename-post-images
description: View each .webp image in a blog post's images/ folder and rename it to a descriptive kebab-case filename based on what the photo actually shows. Use after copying/processing photos into src/content/blog/<slug>/images/, when the user asks to rename post images, name the photos, or clean up generic filenames like IMG_1234.webp or DSC0001.webp.
---

# Rename Post Images

Rename the freshly-copied `.webp` photos in a post's `images/` directory from
generic camera names (`IMG_1234.webp`, `DSC0001.webp`) to **descriptive
kebab-case** names that reflect what each photo shows.

## Prerequisites

- Images are already `.webp` and copied into `src/content/blog/<slug>/images/`
  (this skill does NOT convert formats — `pnpm process-images <slug>` does that).
- Run this **before** the photos are referenced in `index.mdx`, otherwise
  renaming breaks the `import ... from './images/...'` lines. If they're already
  imported, update those imports too (see step 5).

## Workflow

1. **Resolve the post.** Ask for the slug if not given. Target directory is
   `src/content/blog/<slug>/images/`. List only top-level `*.webp` files —
   **skip the `raw/` subdirectory** (those are source files).

2. **View every image.** Use the Read tool on each `.webp` — it renders the
   photo. Don't rename from filenames alone; look at the actual content.

3. **Choose a descriptive kebab-case name.** Lowercase, hyphen-separated,
   `[a-z0-9-]` only, `.webp` extension. Describe the subject/action/place, not
   the camera. Aim for 2-4 words.
   - `IMG_4821.webp` → `skinning-toward-baker.webp`
   - `DSC0007.webp` → `thunder-glacier-view.webp`
   - `IMG_4990.webp` → `group-summit-stoke.webp`
   - Leave a file alone if its name is already descriptive kebab-case.
   - Match the place/people vocabulary the user uses; ask if a location or
     person is ambiguous rather than guessing a proper noun.

4. **Keep names unique.** If two photos map to the same description, suffix the
   later ones (`-2`, `-3`). Never overwrite an existing file.

5. **Order chronologically and prefix.** Sort the photos by capture time and
   prefix each descriptive name with a zero-padded ordinal — `01-`, `02-`, … —
   so the folder sorts in shooting order in Finder. Final names look like
   `04-moonrise-over-ridge.webp`.
   - Get capture time from the **raw originals** in `images/raw/`:
     `mdls -name kMDItemContentCreationDate -raw <file>`. Match each webp to its
     source by the pre-rename filename (the webp name was the kebab of the raw
     basename).
   - Camera filenames embedding a timestamp (`IMG20260606074726`) already sort
     chronologically, but **sequence numbers** (`IMG_3318`) only order within one
     camera — when a post mixes cameras (phone HEIC + camera JPG), the two streams
     interleave, so always merge by actual capture time, not by filename.
   - Pad to the digit width of the total count (2 digits for ≤ 99 photos).

6. **Rename.** Use `git mv <old> <new>` for tracked files, or plain `mv` if the
   post directory is still untracked (new posts usually are — `git mv` errors on
   untracked files). If a file is already imported in `index.mdx`, also update its
   `import` line and every `src={...}` / `images={[...]}` reference.

7. **Report the mapping.** Print an old → new table in chronological order so the
   user can sanity-check, and note any files you left unchanged or were unsure of.

## Notes

- Descriptive names (minus the `NN-` prefix) become camelCase import identifiers
  (`04-moonrise-over-ridge.webp` → `moonriseOverRidge`). JS identifiers can't
  start with a digit, so the prefix is **stripped** when importing — the
  [new-trip-report](../new-trip-report/SKILL.md) skill handles this.
- If any webp appears **rotated sideways**, that's an EXIF-orientation bug from an
  older `process-images` run — reprocess with `pnpm process-images <slug>` (now
  fixed with `.rotate()`) rather than trying to fix it here.
- Don't touch non-image files or the `raw/` folder.
