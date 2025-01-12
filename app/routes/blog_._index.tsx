import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import BlogPostCard from '~/components/BlogPostCard'

import { getPosts } from '~/lib/posts'

export const loader = async () => json(await getPosts())

export default function BlogIndex() {
  const posts = useLoaderData<typeof loader>()

  return (
    <div className="py-8 flex flex-col items-center">
      <section className="max-w-4xl flex flex-col gap-6">
        <h1 className="text-4xl md:text-4xl font-extrabold min-w-4xl">Blog</h1>
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} postMeta={post} />
          ))}
        </div>
      </section>
    </div>
  )
}
