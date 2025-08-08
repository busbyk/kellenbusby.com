import { Media } from '@/payload-types'
import { revalidateBlockReferences } from '@/utils/revalidation/revalidateBlockReferences'
import { revalidateRelationshipReferences } from '@/utils/revalidation/revalidateRelationshipReferences'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

async function revalidate(docId: number) {
  await revalidateBlockReferences({
    collection: 'media',
    id: docId,
  })
  await revalidateRelationshipReferences({
    collection: 'media',
    id: docId,
  })
}

export const revalidateMedia: CollectionAfterChangeHook<Media> = async ({
  doc,
  req: { context },
}) => {
  if (context.disableRevalidate) return

  await revalidate(doc.id)

  // TODO: revalidate blog index if media is in a blog image which would appear in a blog post card on the blog index page
}

export const revalidateMediaDelete: CollectionAfterDeleteHook<Media> = async ({
  doc,
  req: { context },
}) => {
  if (context.disableRevalidate) return

  await revalidate(doc.id)

  // TODO: revalidate blog index if media is in a blog image which would appear in a blog post card on the blog index page
}
