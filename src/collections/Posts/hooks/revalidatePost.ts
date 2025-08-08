import { Post } from '@/payload-types'
import { revalidateBlockReferences } from '@/utils/revalidation/revalidateBlockReferences'
import { revalidatePaths } from '@/utils/revalidation/revalidatePaths'
import { revalidateRelationshipReferences } from '@/utils/revalidation/revalidateRelationshipReferences'
import { revalidatePath, revalidateTag } from 'next/cache'
import type { BasePayload, CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

const revalidate = async ({
  docId,
  slug,
  payload,
}: {
  docId: number
  slug: string
  payload: BasePayload
}) => {
  const paths = [`/blog/${slug}`]
  payload.logger.info(`Revalidating paths: ${paths.join(', ')}`)

  revalidatePaths(paths)
  revalidateTag('posts-sitemap')

  await revalidateBlockReferences({
    collection: 'posts',
    id: docId,
  })
  await revalidateRelationshipReferences({
    collection: 'posts',
    id: docId,
  })
}

export const revalidatePost: CollectionAfterChangeHook<Post> = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return

  if (doc._status === 'published') {
    revalidate({ docId: doc.id, slug: doc.slug, payload })
  }

  // If the post was previously published, and it is no longer published or the slug has changed
  // we need to revalidate the old path
  if (
    previousDoc._status === 'published' &&
    (doc._status !== 'published' || previousDoc.slug !== doc.slug)
  ) {
    payload.logger.info('Revalidating old post')
    revalidate({ docId: doc.id, slug: previousDoc.slug, payload })
  }

  // Also revalidate the blog listing page for any published post changes
  if (doc._status === 'published' || previousDoc?._status === 'published') {
    // TODO: only revalidate blog index page if this doc appears there
    revalidatePath('/blog')
  }

  // Revalidate tag pages this post might appear on
  if (doc.tags && doc.tags.length > 0) {
    const resolvedTags = await Promise.all(
      doc.tags.map(async (tag) => {
        let tagDoc = tag

        if (typeof tagDoc === 'number') {
          tagDoc = await payload.findByID({
            collection: 'tags',
            id: tagDoc,
          })
        }

        return tagDoc
      }),
    )

    resolvedTags.forEach((tag) => revalidatePath(`/blog/tags/${tag.slug}`))
  }
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({
  doc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return

  revalidate({ docId: doc.id, slug: doc.slug, payload })
}
