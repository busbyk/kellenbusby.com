import type { Metadata } from 'next/types'

import { PageRange } from '@/components/PageRange'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageLayout from '@/components/layout/PageLayout'
import Link from 'next/link'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    select: {
      title: true,
      slug: true,
      tags: true,
      meta: true,
    },
  })

  return (
    <PageLayout heading="Blog">
      {posts.docs.map((post) => (
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      ))}
      <PageRange
        collection="posts"
        currentPage={posts.page}
        limit={12}
        totalDocs={posts.totalDocs}
      />
    </PageLayout>
  )
}
