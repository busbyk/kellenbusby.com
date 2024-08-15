// import { sentryVitePlugin } from '@sentry/vite-plugin';
import { vitePlugin as remix } from '@remix-run/dev'
import { installGlobals } from '@remix-run/node'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { vercelPreset } from '@vercel/remix/vite'

installGlobals()

export default defineConfig({
  ssr: {
    noExternal: ['react-use'],
  },
  plugins: [
    remix({
      presets: [vercelPreset()],
    }),
    tsconfigPaths(),
    // sentryVitePlugin({
    //   org: 'kellen-busby-software-llc',
    //   project: 'cardonomics-fe-web',
    //   authToken: process.env.SENTRY_AUTH_TOKEN,
    //   telemetry: false,
    //   sourcemaps: {
    //     filesToDeleteAfterUpload: 'build/**/*.js.map',
    //   },
    // }),
  ],
  // build: {
  //   sourcemap: true,
  // },
  server: {
    port: 3000,
  },
})
