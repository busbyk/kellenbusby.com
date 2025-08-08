import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import BlogPostCard from '@/components/BlogPostCard'
import PageLayout from '@/components/layout/PageLayout'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-static'
export const revalidate = 600

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const tags = await payload.find({
    collection: 'tags',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = tags.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function TagPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const tag = await queryTagBySlug({ slug })
  const posts = await queryPostsByTag({ slug })

  if (!tag) return notFound()

  return (
    <PageLayout heading={`Posts tagged "${tag.name}"`} className="flex-grow">
      {posts.length > 0 ? (
        <div className="grid md:grid-cols-2">
          {posts.map((post) => (
            <BlogPostCard post={post} key={post.id} />
          ))}
        </div>
      ) : (
        <p className="text-muted">No posts found for this tag.</p>
      )}
    </PageLayout>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const tag = await queryTagBySlug({ slug })

  if (!tag) return {}

  return {
    title: `Posts tagged "${tag.name}" - Kellen Busby`,
    description: `Browse all posts tagged with "${tag.name}"`,
  }
}

const queryTagBySlug = cache(async ({ slug }: { slug: string }) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'tags',
    draft: false,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})

const queryPostsByTag = cache(async ({ slug }: { slug: string }) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    draft: false,
    limit: 100,
    overrideAccess: false,
    where: {
      'tags.slug': {
        equals: slug,
      },
    },
  })

  return result.docs || []
})
