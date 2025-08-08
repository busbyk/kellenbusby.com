import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getRelationshipsFromConfig } from './getRelationshipsFromConfig'
import { DocumentForRevalidation, RevalidationReference } from './revalidateDocument'

/**
 * Find all pages and posts that contain relationship fields referencing a specific document
 * This is used for revalidation when reference collections change
 */
export async function findDocumentsWithRelationshipReferences(
  reference: RevalidationReference,
): Promise<DocumentForRevalidation[]> {
  const payload = await getPayload({ config: configPromise })
  const results: DocumentForRevalidation[] = []

  const { postsRelationshipMappings } = await getRelationshipsFromConfig()

  const postsMappings = postsRelationshipMappings[reference.collection]

  if (postsMappings) {
    for (const mapping of postsMappings) {
      try {
        const postsWithRelationsRes = await payload.find({
          collection: 'posts',
          where: {
            and: [
              {
                _status: { equals: 'published' },
              },
              {
                [mapping.fieldPath]: { equals: reference.id },
              },
            ],
          },
          select: {
            id: true,
            slug: true,
          },
          depth: 1,
        })

        const postsWithRelations: DocumentForRevalidation[] = postsWithRelationsRes.docs.map(
          (doc) => ({
            collection: 'posts',
            id: doc.id,
            slug: doc.slug,
          }),
        )

        results.push(...postsWithRelations)
      } catch (error) {
        payload.logger.warn(
          `Error querying posts for ${reference.collection} reference ${reference.id} at ${mapping.fieldPath}: ${error}`,
        )
      }
    }
  }

  return results
}
