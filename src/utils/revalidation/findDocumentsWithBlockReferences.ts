import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getBlocksFromConfig } from './getBlocksFromConfig'
import { DocumentForRevalidation, RevalidationReference } from './revalidateDocument'

/**
 * Find all pages and posts that contain blocks referencing a specific document
 * This is used for revalidation when reference collections (biographies, teams, media, forms) change
 */
export async function findDocumentsWithBlockReferences(
  reference: RevalidationReference,
): Promise<DocumentForRevalidation[]> {
  const payload = await getPayload({ config: configPromise })
  const results: DocumentForRevalidation[] = []

  const { postsBlockMappings } = await getBlocksFromConfig()

  const postsMapping = postsBlockMappings[reference.collection]

  if (postsMapping) {
    try {
      const postsWithBlocksRes = await payload.find({
        collection: 'posts',
        where: {
          and: [
            {
              _status: { equals: 'published' },
            },
            {
              'blocksInContent.collection': { equals: reference.collection },
            },
            {
              'blocksInContent.blockId': { equals: reference.id },
            },
          ],
        },
        select: {
          id: true,
          slug: true,
        },
        depth: 1,
      })

      const postsWithBlocks: DocumentForRevalidation[] = postsWithBlocksRes.docs.map((doc) => ({
        collection: 'posts',
        id: doc.id,
        slug: doc.slug,
      }))

      results.push(...postsWithBlocks)
    } catch (error) {
      payload.logger.warn(
        `Error querying posts for ${reference.collection} reference ${reference.id}: ${error}`,
      )
    }
  }

  return results
}
