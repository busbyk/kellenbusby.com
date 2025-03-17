import { createReader } from '@keystatic/core/reader'
import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'

import keystaticConfig from '../../keystatic.config'
import PageLayout from '~/components/layout/PageLayout'
import BlogPostCard from '~/components/BlogPostCard'

export async function loader() {
  const reader = createReader(process.cwd(), keystaticConfig)
  const posts = await reader.collections.posts.all()
  const publishedPosts = posts.filter((post) => post.entry.published)
  return json({ posts: publishedPosts })
}

export default function Page() {
  const { posts } = useLoaderData<typeof loader>()

  return (
    <PageLayout heading="Blog">
      {posts.map((post) => (
        <BlogPostCard post={post} />
      ))}
    </PageLayout>
  )
}
