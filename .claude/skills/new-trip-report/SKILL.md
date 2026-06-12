---
name: new-trip-report
description: Scaffold a trip-report blog post — build the TripStats block from Strava data and lay out a suggested sequence of photos (BlogImage / ImageRow groupings) with draft alt text and section headers. Use when the user wants to start, scaffold, or draft a trip report, ski/climb/bike trip post, or asks to set up the skeleton of a post and suggest photo combinations.
---

# New Trip Report

Build the skeleton of a trip-report post: a filled-in `<TripStats>` block plus a
suggested narrative arrangement of the post's photos using `BlogImage` and
`ImageRow`. The user writes the prose; this skill produces the structure.

## Prerequisites

- A post directory exists. If not, create one: `pnpm new-post "Trip Title"`
  (scaffolds `src/content/blog/<slug>/index.mdx` + `images/`).
- Photos should already be copied, processed to `.webp`, and ideally renamed via
  [rename-post-images](../rename-post-images/SKILL.md) so import names read well.

## Step 1 — Gather trip stats

Fill these `TripStats` props (see `src/components/TripStats.astro`):
`date` (required), `route` (required), and optional `distance`, `elevation`
(vert), `time`, `group`, and an `activities` breakdown (per-leg
name/distance/elevation). Only the headline stats you pass are rendered — omit
`distance`/`elevation`/`time` rather than filling them with placeholders.

**Single-day vs multi-sport / multi-day trips:**
- **Single objective** (one ski tour, one climb) → one `TripStats` block at the
  top, the canonical case.
- **Multi-sport / multi-day** (e.g. a weekend of bikes + two climbing days) →
  **lead with one summary block at the top of the article**: `date` as a range
  (`"June 5–7, 2026"`), a `route` overview joining the days/objectives, `group`,
  and `time` repurposed as a span (`"3 days"`) if there's no single total.
  Then **optionally** add a per-activity `TripStats` under each day's section
  (e.g. the specific route + grade). Ask the user whether they want the per-day
  blocks — they don't always. Keep activity `name`s short-ish (they render as an
  uppercase label column), but longer ones like `Climb` now fit.

Sources, in order of convenience:
- **Pasted Strava text** → parse out distance, elevation gain, moving/elapsed
  time, date.
- **A Strava link** → you usually can't fetch it; just ask the user to read off
  or paste the numbers. Keep it conversational.
- **Just chatting** → ask for whatever's missing. Always confirm the human-
  readable formats below.

Formatting (match existing posts):
- `date="April 18, 2026"` — long form
- `distance="23.51 mi"`, `elevation="9,752 ft"` — value + unit, comma thousands
- `time="10h 59m"`
- `route="Heliotrope Ridge → Thunder Glacier → Coleman Glacier"` — use `→`
- `activities={[{ name: 'Bike', distance: '7 mi', elevation: '2,000 ft' }, ...]}`
  — only when the day had distinct legs (bike/hike/ski). Short `name` (~one word,
  it renders in a narrow column).

`TripStats` has fixed fields, so adapt them per trip type:
- **Ski / bike / linkup** — the canonical case above; `activities` splits the
  day by mode of travel.
- **Climbing** — `route` is the climb(s) and grade, e.g.
  `route="Careno Crag → Givler's Crack (5.8)"`; list multiple routes with `→`.
  `distance`/`elevation` are the approach (round-trip miles, vert), `time` is
  car-to-car. Use `activities` for the legs (`Approach` / `Climb` / `Descent`) or
  to itemize routes/pitches (`{ name: 'P1', distance: '5.9' }`) — or omit it for a
  simple crag day. There's no grade field, so keep grades in `route`/`activities`.
  Ask the user for approach stats and the route list / grades if not provided.

## Step 2 — Plan the photo sequence

1. List and **view** every `*.webp` in `images/` (skip `raw/`). Read each one.
2. Group them into a rough chronological/narrative order: approach → ascent →
   summit/objective → descent → wrap-up. If the files carry `NN-` prefixes from
   [rename-post-images](../rename-post-images/SKILL.md) they're already in
   shooting order — use that order directly. For a **multi-day** trip, group by
   day first (the prefixes already interleave the days correctly).
3. Assign each photo a component:
   - **`BlogImage`** — a single full-column image. Use for the hero/standout
     shots and for **panoramas** (they shine full-width). It auto-narrows
     portraits so a tall photo doesn't dominate.
   - **`ImageRow`** — 2-3 related photos side by side (Max 3). Works for both
     portrait and landscape; two portraits sit tall side-by-side (capped at
     viewport height), which is the common case for phone shots. Good for pairing
     approach shots, a detail + scene, or a triptych of a sequence.
4. Draft `alt` text (factual: subject + action + setting) and an optional short
   `caption` (voice-y, like the user's existing captions) for each.
5. Pick a **hero**: the trip's signature frame (often a striking action or
   summit shot). You'll set it in the frontmatter in Step 3.

## Step 3 — Write the skeleton into index.mdx

Produce, in order:
1. The component imports (already present from `new-post`, add `TripStats`):
   ```mdx
   import TripStats from '@components/TripStats.astro'
   ```
2. The image imports (camelCase identifier from the kebab filename, **stripping
   any `NN-` chronological prefix** — JS identifiers can't start with a digit):
   ```mdx
   import thunderGlacierView from './images/thunder-glacier-view.webp'
   import moonriseOverRidge from './images/04-moonrise-over-ridge.webp'
   ```
   Keep the imports in the photos' chronological/narrative order so the file
   reads top-to-bottom like the trip.
3. The frontmatter: set `heroImage` to the chosen hero (this is a string path, so
   **keep** the `NN-` prefix — `heroImage: ./images/07-looking-down-the-pitch.webp`),
   plus `heroImageAlt`, a draft `description`, kebab-case `tags`, and
   `tripReport: true` (enables the "View as story" mode on the post).
4. The filled `<TripStats ... />` block(s) — the summary at the top, and per-day
   blocks under each day's section if used (see Step 1).
5. **Strava embed.** If the user pastes the embed snippet from Strava
   (Share → Embed), drop it in verbatim — both the `<div
   class="strava-embed-placeholder" data-embed-id="..." data-token="...">` and the
   `<script src="https://strava-embeds.com/embed.js">`. The `data-token` only
   comes from that snippet, so if they give just a link/ID, leave a
   `{/* TODO: Strava embed */}` and ask for the snippet. If the embed renders
   blank, the fix is loading the script once in `Layout.astro` instead of inline.
6. **Video.** Process a raw clip with `pnpm process-videos <slug>` (→ a web
   `.mp4` + `-poster.webp`), then use `BlogVideo` with an imported `src` (the
   `.mp4`) and `poster` (the `-poster.webp?url`); add `portrait` for vertical
   clips. For a short silent loop, `pnpm mp4-to-gif` + `BlogImage` is an
   alternative. Leave a `{/* TODO: video */}` noting the source file in `raw/`.
7. Section headers with the planned image components under them and `{/* prose */}`
   placeholders. Adapt the headers to the trip: a single objective follows the arc
   (`## The Setup` → `## The Approach` → `## The Descent` → `## Wrap Up`); a
   **multi-day** trip reads better with day-based headers (`## Friday: …`,
   `## Saturday: …`).

See `src/content/blog/e-bike-to-backcountry-ski-on-mount-baker/index.mdx`
(single-day) and
`src/content/blog/leavenworth-climbing-it-only-hailed-for-a-pitch/index.mdx`
(multi-day, summary + per-day stats) for the canonical shapes.

## Step 4 — Hand off

Summarize: the stats you used (flag any you guessed), the photo order and
groupings, the hero you picked, and which sections still need prose. Note any
`TODO`s left (Strava snippet, video). Confirm the `group` if you inferred it, and
remind the user to refine `description`/`tags` and flip `published: true` when
ready.
