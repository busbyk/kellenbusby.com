import { Tag } from '@/payload-types'
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
  const paths = [`/blog/tags/${slug}`]
  payload.logger.info(`Revalidating paths: ${paths.join(', ')}`)

  revalidatePaths(paths)
  revalidateTag('posts-sitemap')

  await revalidateBlockReferences({
    collection: 'tags',
    id: docId,
  })
  await revalidateRelationshipReferences({
    collection: 'tags',
    id: docId,
  })
}

export const revalidateTagHook: CollectionAfterChangeHook<Tag> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return

  revalidate({ docId: doc.id, slug: doc.slug, payload })

  // If slug changed, revalidate old path
  if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
    payload.logger.info(`Revalidating old tag`)
    revalidate({ docId: doc.id, slug: previousDoc.slug, payload })
  }

  // TODO: only revalidate blog index page if this tag appears on posts
  revalidatePath('/blog')
}

export const revalidateTagDelete: CollectionAfterDeleteHook<Tag> = ({
  doc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return

  revalidate({ docId: doc.id, slug: doc.slug, payload })

  // TODO: only revalidate blog index page if this tag appears on posts
  revalidatePath('/blog')
}
