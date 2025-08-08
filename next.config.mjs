import { withPayload } from '@payloadcms/next/withPayload'

if (!process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error('NEXT_PUBLIC_APP_URL environment variable is required')
}

const url = new URL(process.env.NEXT_PUBLIC_APP_URL)

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: url.protocol.replace(':', ''),
        hostname: url.hostname,
        ...(url.port && { port: url.port }),
        pathname: '/api/media/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/stats/js/script.js',
        destination: 'https://plausible.io/js/script.js',
      },
      {
        source: '/stats/api/event',
        destination: 'https://plausible.io/api/event',
      },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
