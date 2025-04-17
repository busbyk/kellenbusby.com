import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'

import PageLayout from '~/components/layout/PageLayout'
import BlogPostCard from '~/components/BlogPostCard'
import { reader } from '~/lib/keystatic-reader.server'

export async function loader() {
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
