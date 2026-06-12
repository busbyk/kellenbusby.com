# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server**: `pnpm dev`
- **Build**: `pnpm build`
- **Preview production build**: `pnpm preview`
- **Create new blog post**: `pnpm new-post "Post Title"`
- **Generate social images**: `pnpm social-image <slug>` (or `--all`, `--force`, `--og-only`, `--instagram-only`)
- **Convert video to GIF**: `pnpm mp4-to-gif <file.mp4>` (also `.mov`/`.webm`/etc.; `--width`, `--fps`, `--colors`, `--start`, `--duration`, `--out`). Requires system `ffmpeg`.
- **Lint**: `npx eslint .`
- **Format**: `npx prettier --write .`

Package manager is **pnpm** (v10.14.0). No test suite exists.

See [docs/writing-posts.md](docs/writing-posts.md) for the post / trip-report authoring workflow (`process-images`, `/rename-post-images`, `/new-trip-report`).

## Architecture

Astro 5 static site with Preact for interactive components. Deployed on Vercel.

**Rendering model**: Pages are `.astro` files (static/SSR). Interactive islands use Preact `.tsx` components (e.g., `HomeContent.tsx` profile switcher). This is Astro's islands architecture — most of the site is static HTML with selective client-side hydration.

**Content system**: Blog posts live in `src/content/blog/<slug>/index.mdx` with co-located `images/` directories. Schema is defined in `src/content.config.ts` using Zod (title, description, pubDate required; tags, heroImage, published optional). Dynamic routing via `src/pages/blog/[...slug].astro` and tag filtering via `src/pages/blog/tags/[tag].astro`.

**Styling**: Tailwind CSS v4 via Vite plugin. Dark mode uses class-based `.dark` on `<html>`, toggled by a script in `Layout.astro` that checks localStorage then system preference. Color tokens are CSS custom properties defined in `src/styles/global.css`.

**Key path aliases**: `@components/*` → `src/components/*` (tsconfig.json).

**Utilities**: `cn()` in `src/lib/utils.ts` combines clsx + tailwind-merge. `useHover()` hook in `src/hooks/useHover.ts`.

**Analytics**: Plausible, proxied through Vercel rewrites (`/plausible/` → `plausible.io`) to avoid ad blockers. Configured in `vercel.json`.

**Social image generation**: `scripts/generate-social-images.js` uses sharp to produce OG (1200×630) and Instagram (1080×1350) images with branded colors. Output goes to `public/og/` and `public/instagram/`.

## Code Style

- No semicolons, single quotes (see `.prettierrc`)
- TypeScript strict mode
- Preact (not React) for JSX — imports from `preact` and `preact/hooks`
