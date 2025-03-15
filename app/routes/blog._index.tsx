import { createReader } from '@keystatic/core/reader'
import { Link, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'

import keystaticConfig from '../../keystatic.config'

export async function loader() {
  const reader = createReader(process.cwd(), keystaticConfig)
  const posts = await reader.collections.posts.all()
  return json({ posts })
}

export default function Page() {
  const { posts } = useLoaderData<typeof loader>()

  return (
    <div className="py-8 flex flex-col items-center">
      <section className="max-w-4xl flex flex-col gap-6">
        <h1 className="text-4xl md:text-4xl font-extrabold min-w-4xl">Blog</h1>
        <ul className="flex flex-col gap-6">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link to={`/blog/${post.slug}`}>{post.entry.title}</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
