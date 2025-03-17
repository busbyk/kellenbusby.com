import { vitePlugin as remix } from '@remix-run/dev'
import { installGlobals } from '@remix-run/node'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { vercelPreset } from '@vercel/remix/vite'

installGlobals()

export default defineConfig({
  ssr: {
    noExternal: ['react-use', /^@keystatic\//, 'minimatch', 'zwitch'],
  },
  plugins: [
    tsconfigPaths(),
    remix({
      presets: [vercelPreset()],
    }),
  ],
  server: {
    port: 3000,
  },
})
