import { Link } from '@remix-run/react'
import { Entry } from '@keystatic/core/reader'
import keystaticConfig from '../../keystatic.config'
import { cn } from '~/lib/utils'

type Post = { slug: string } & {
  entry: Entry<(typeof keystaticConfig)['collections']['posts']>
}

export default function BlogPostCard({
  className,
  post,
}: {
  className?: string
  post: Post
}) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className={cn('rounded-md border p-4', className)}
    >
      <h2 className="text-xl font-bold">{post.entry.title}</h2>
      <p className="">{post.entry.description}</p>
      <div className="flex items-center gap-2 pt-2">
        {post.entry.tags.map((tag) => (
          <div
            key={tag}
            className="border rounded-md py-0.5 px-2 text-theme-white/80 text-sm capitalize"
          >
            {tag?.replace('-', ' ')}
          </div>
        ))}
      </div>
    </Link>
  )
}
