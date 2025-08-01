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
    <PageLayout heading="Blog" className="flex-grow">
      <div className="grid grid-cols-2">
        {posts.docs.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <div className="border-border rounded-md p-3 bg-card text-card-foreground hover:bg-card/80 flex flex-col gap-4">
              <h2 className="text-2xl">{post.title}</h2>
              <div className="border rounded px-2 py-0.5 w-fit">
                {post.tags?.map((tag) => typeof tag !== 'string' && tag.name)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </PageLayout>
  )
}
