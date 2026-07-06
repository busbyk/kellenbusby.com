// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import preact from '@astrojs/preact'
import mdx from '@astrojs/mdx'

// https://astro.build/config
export default defineConfig({
  integrations: [preact(), mdx()],
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
