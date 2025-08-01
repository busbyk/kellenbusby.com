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
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
