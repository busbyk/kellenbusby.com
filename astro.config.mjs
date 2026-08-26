// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import preact from '@astrojs/preact'
import mdx from '@astrojs/mdx'
import rehypeExternalLinks from 'rehype-external-links'

// https://astro.build/config
export default defineConfig({
  integrations: [preact(), mdx()],
  markdown: {
    // external links from post prose open in a new tab; internal links
    // (same host, relative) keep default same-tab navigation
    rehypePlugins: [
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
    ],
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      // mirrors the /strava-embed/* rewrite in vercel.json so the live
      // kudos fetch works in dev too
      proxy: {
        '/strava-embed': {
          target: 'https://strava-embeds.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/strava-embed/, ''),
        },
      },
    },
  },
  server: {
    allowedHosts: ['6b95-2601-602-87f-31d0-6184-7cab-b720-dbbe.ngrok-free.app'],
  },
})
