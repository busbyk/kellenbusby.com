import configPromise from '@payload-config'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getPayload } from 'payload'

export interface RevalidationReference {
  collection: 'media' | 'tags' | 'posts'
  id: number
}

export interface DocumentForRevalidation {
  collection: 'posts'
  id: number
  slug: string
}

export async function revalidateDocument(doc: DocumentForRevalidation): Promise<void> {
  const payload = await getPayload({ config: configPromise })

  if (doc.collection === 'posts') {
    const basePaths = [`/blog/${doc.slug}`]

    payload.logger.info(
      `Revalidating ${doc.collection} ${doc.slug} at paths: ${basePaths.join(', ')}`,
    )

    basePaths.forEach((path) => revalidatePath(path))
    revalidateTag('posts-sitemap')
  }
}
