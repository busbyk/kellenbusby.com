# Writing posts / trip reports

## Workflow

1. `pnpm new-post "Trip Title"` — scaffolds `src/content/blog/<slug>/index.mdx` + `images/`
2. Drop raw photos + videos into `src/content/blog/<slug>/images/raw/`
3. `pnpm process-images <slug>` — converts raw → optimized `.webp` (auto-rotates, q92)
4. `pnpm process-videos <slug>` — compresses raw videos → web-ready `.mp4` + `-poster.webp`, prints import/usage snippets
5. `/rename-post-images <slug>` — descriptive kebab-case names, chronological `NN-` prefixes
6. `/new-trip-report <slug>` — scaffolds TripStats + photo layout + section headers
7. Write the prose, fill frontmatter, set `published: true`
8. `pnpm social-image <slug>` — OG + Instagram images
9. `pnpm dev` — preview

## Commands

| Command | Does |
| --- | --- |
| `pnpm new-post "Title"` | New post skeleton |
| `pnpm process-images <slug>` | `images/raw/*` → `images/*.webp` (`--quality`, `--file`) |
| `pnpm process-videos <slug>` | `images/raw/*` videos → `images/*.mp4` + poster webp (`--crf`, `--max`, `--file`, `--mute`) |
| `pnpm social-image <slug>` | Social images (`--all`, `--force`, `--og-only`, `--instagram-only`) |
| `pnpm webp-to-gif <…>` | Convert a clip to gif (for `BlogImage`) |
| `pnpm dev` / `pnpm build` | Preview / production build |

## Components (in MDX)

- `BlogImage` — single full-column image; best for heroes + panoramas
- `ImageRow` — 2-3 images side by side (portrait or landscape)
- `BlogVideo` — native `<video>` for self-hosted clips: `src` (imported `.mp4`), `poster` (imported `-poster.webp?url`), `portrait` for vertical clips. ImageKit `/player/embed/` URLs still render as an iframe (legacy posts).
- `TripStats` — stat card; `date` + `route` required, rest optional. For multi-day trips, lead with one summary block, then optional per-day blocks.

## Gotchas

- Image imports use the camelCase name **without** the `NN-` prefix; `heroImage` is a path that **keeps** it.
- Strava: paste the full embed snippet (Share → Embed) incl. its `<script>` — the `data-token` only comes from there.
- Quality/sizing is handled in `BlogImage`/`ImageRow` (`sizes` = 896px column, retina `widths`). Don't lower it.
