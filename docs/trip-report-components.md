# Trip-report components

Full props reference for the MDX components used in blog posts and trip reports. For the authoring workflow (image processing, scaffolding, social images), see [writing-posts.md](writing-posts.md).

## Frontmatter options

Beyond the required `title` / `description` / `pubDate` (schema in `src/content.config.ts`):

| Key                          | Effect                                                                                                               |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `published: true`            | Post appears on the site (drafts are hidden)                                                                         |
| `tripReport: true`           | Adds the "View as story" button; photos open in the full-screen story/carousel experience                            |
| `storyMode: false`           | Opts a `tripReport` post back out of story mode (e.g. a scrollytelling post that has its own presentation)           |
| `heroImage` / `heroImageAlt` | Hero at the top of the post; the hero also joins the lightbox as its own group. Path keeps the `NN-` filename prefix |
| `tags: [...]`                | Tag pills + tag pages                                                                                                |

The lightbox, mobile carousel, and story viewer all attach automatically to `BlogImage` / `ImageRow` images — no extra wiring in the post.

## TripStats

Stat card, usually right under the intro. For multi-day trips: one summary block up top, then optional per-day blocks under each day's header.

| Prop         | Required | Notes                                                                              |
| ------------ | -------- | ---------------------------------------------------------------------------------- |
| `date`       | ✓        | Free-form string — a single date or a range (`"June 5-7, 2026"`)                   |
| `route`      | ✓        | Free-form route/objective description                                              |
| `distance`   |          | e.g. `"6.1 mi"` — shown as **Distance**                                            |
| `elevation`  |          | e.g. `"1,281 ft"` — shown as **Vert**                                              |
| `time`       |          | e.g. `"54m"` or `"3 days"`                                                         |
| `group`      |          | Who came along                                                                     |
| `activities` |          | `{ name, distance?, elevation? }[]` — per-activity breakdown for multi-sport trips |

Distance/Vert/Time are each optional and the headline grid adapts, so a multi-day summary can be just a date range + route + `activities` breakdown.

```mdx
<TripStats
  date="June 5-7, 2026"
  time="3 days"
  route="Bikes Friday · Outer Space (5.9) Saturday · Pearly Gates Sunday"
  group="Me, Addison"
/>
```

With an activity breakdown:

```mdx
<TripStats
  date="June 5-7, 2026"
  route="Leavenworth weekend"
  activities={[
    { name: 'Mountain biking', distance: '6.1 mi', elevation: '1,281 ft' },
    { name: 'Outer Space (5.9)', elevation: '900 ft' },
  ]}
/>
```

## RouteMap

Interactive route card: MapLibre GL map (OpenFreeMap basemap, hillshade terrain, dark-mode style swap) + stats row + GPX download + optional Strava link with live kudos. Needs a co-located `.gpx` imported twice:

```mdx
import rosyBoaMtbGpx from './rosy-boa-mtb.gpx?raw'
import rosyBoaMtbGpxUrl from './rosy-boa-mtb.gpx?url'
```

`pnpm strava-route <slug>` writes the whole block from a pasted Strava embed; for non-Strava routes, hand-write it with any GPX.

| Prop          | Required | Notes                                                                                                                                                              |
| ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `title`       | ✓        | Card heading                                                                                                                                                       |
| `gpx`         | ✓        | The `?raw` import — track points are parsed at build time                                                                                                          |
| `gpxUrl`      |          | The `?url` import — enables the download button                                                                                                                    |
| `gpxFilename` |          | Download filename (default `route.gpx`)                                                                                                                            |
| `date`        |          | Shown next to the title                                                                                                                                            |
| `stats`       |          | `{ label, value }[]` — free-form; typically Distance / Elev Gain / Time                                                                                            |
| `basemap`     |          | `'default'` street tiles or `'topo'` (OpenTopoMap) — contours + trails, much clearer in the mountains                                                              |
| `terrain`     |          | Start in 3D — DEM terrain relief with a pitched camera, compass/pitch controls, and a 3D/2D toggle that eases camera + terrain together. Works with either basemap |
| `pitch`       |          | Camera tilt in 3D mode, degrees from overhead (default 55) — lower shows more of the route                                                                         |
| `bearing`     |          | Map rotation, degrees clockwise from north — frame a diagonal route by aligning it with the card                                                                   |
| `stravaUrl`   |          | Adds the Strava link                                                                                                                                               |
| `kudos`       |          | Build-time kudos count (placeholder until the live fetch lands)                                                                                                    |
| `embedToken`  |          | From the Strava embed snippet — enables the client-side kudos re-fetch through the `/strava-embed/*` proxy                                                         |

```mdx
<RouteMap
  title={'Via Ferrata Laurenzi'}
  date="September 1, 2025"
  gpx={viaFerrataLaurenziGpx}
  gpxUrl={viaFerrataLaurenziGpxUrl}
  gpxFilename="via-ferrata-laurenzi.gpx"
  basemap="topo"
  stats={[{ label: 'Distance', value: '2.6 mi' }]}
/>
```

## BlogImage

Single full-column image; best for heroes and panoramas. Portrait images are auto-detected (height > width) and rendered narrower + centered.

| Prop      | Required | Notes                                                        |
| --------- | -------- | ------------------------------------------------------------ |
| `src`     | ✓        | Imported image (camelCase name **without** the `NN-` prefix) |
| `alt`     | ✓        |                                                              |
| `caption` |          | Rendered as a figcaption                                     |
| `url`     |          | Wraps the image in a link                                    |

```mdx
<BlogImage
  src={bikeOverlookPanorama}
  alt="Panorama over Leavenworth from the Rosy Boa overlook"
  caption="Rosy Boa has a great view of town."
/>
```

## ImageRow

2–3 images side by side. Widths are balanced by aspect ratio so mixed portrait/landscape photos render at the same height with even gaps.

| Prop       | Required | Notes                                |
| ---------- | -------- | ------------------------------------ |
| `images`   | ✓        | Tuple of 2 or 3 imported images      |
| `alts`     |          | Parallel array of alt text           |
| `captions` |          | Parallel array; use `''` to skip one |
| `urls`     |          | Parallel array of links              |

```mdx
<ImageRow
  images={[mountainBikeRepair, mountainBikeTrailStop]}
  alts={[
    'Overhead view of two riders working on a mountain bike tire on the trail',
    'Mountain biker stopped on forest singletrack with evening light through the pines',
  ]}
/>
```

## BlogVideo

Native `<video>` for self-hosted clips (processed by `pnpm process-videos`). Legacy ImageKit `/player/embed/` URLs still render as an iframe.

| Prop       | Required | Notes                                        |
| ---------- | -------- | -------------------------------------------- |
| `src`      | ✓        | Imported `.mp4`                              |
| `poster`   |          | Imported `-poster.webp?url`                  |
| `caption`  |          | Rendered as a figcaption                     |
| `portrait` |          | Narrows + centers vertical clips             |
| `title`    |          | Accessibility title (default "Video player") |

```mdx
<BlogVideo
  src={rosengartenGroup}
  poster={rosengartenGroupPoster}
  caption="The Rosengarten Group in The Dolomites"
/>
```

## Experimental: scrollytelling (branch-only)

`ScrollyMap` / `ScrollySection` / `ScrollyInterlude` power the map-driven Bailey Range post, but live only on the `baileys-scrollytell` branch. They consume pre-processed track JSON (not GPX) with per-section camera overrides and a photo-coordinate sidecar. Not ready for general use — reach for them only if a post should be map-driven rather than photo-driven, and expect to bring the branch up to date first.
