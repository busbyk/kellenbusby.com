import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import BlogPostCard from '~/components/BlogPostCard'

import { getPosts } from '~/lib/posts'

export const loader = async () => json(await getPosts())

export default function Component() {
  const posts = useLoaderData<typeof loader>()

  return (
    <div className="pt-8 flex flex-col items-center">
      <div className="max-w-6xl flex flex-col gap-6">
        {posts.map((post) => (
          <BlogPostCard key={post.slug} postMeta={post} />
        ))}
      </div>
    </div>
  )
}
