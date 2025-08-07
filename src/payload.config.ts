import { Post } from '@/payload-types'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { resendAdapter } from '@payloadcms/email-resend'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Tags } from './collections/Tags'
import { Users } from './collections/Users'
import { getURL } from './utils/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const generateTitle: GenerateTitle<Post> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Kellen Busby` : 'Kellen Busby'
}

const generateURL: GenerateURL<Post> = ({ doc }) => {
  const url = getURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export default buildConfig({
  admin: {
    autoLogin:
      process.env.NODE_ENV === 'development'
        ? {
            email: 'kellenbusby+kb.com@gmail.com',
            password: 'localpass',
            prefillOnly: true,
          }
        : false,
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Posts, Tags],
  editor: lexicalEditor(),
  email: resendAdapter({
    defaultFromAddress: 'me@kellenbusby.com',
    defaultFromName: 'Kellen Busby',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || '',
      authToken: process.env.DATABASE_AUTH_TOKEN || '',
    },
  }),
  sharp,
  plugins: [
    seoPlugin({
      generateTitle,
      generateURL,
    }),
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
  debug: true,
})
