import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import BlogPostCard from '~/components/BlogPostCard'

import { getPosts } from '~/lib/posts'

export const loader = async () => json(await getPosts())

export default function BlogIndex() {
  const posts = useLoaderData<typeof loader>()

  return (
    <div className="pt-8 flex flex-col items-center">
      <div className="max-w-6xl flex flex-col gap-6">
        <h1 className="text-xl md:text-4xl font-bold">Blog</h1>
        <div className="max-w-6xl flex flex-col gap-6">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} postMeta={post} />
          ))}
        </div>
      </div>
    </div>
  )
}
