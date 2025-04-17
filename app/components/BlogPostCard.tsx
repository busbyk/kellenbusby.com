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
      className={cn(
        'rounded-md border border-theme-primary/20 dark:border-theme-primary/20 light:border-theme-light-primary/20 p-4 bg-theme-bg-surface/50 dark:bg-theme-bg-surface/50 light:bg-theme-light-bg-surface/50 hover:bg-theme-bg-surface dark:hover:bg-theme-bg-surface light:hover:bg-theme-light-bg-surface transition-colors duration-200',
        className
      )}
    >
      <h2 className="text-xl font-bold text-theme-text dark:text-theme-text light:text-theme-light-text">
        {post.entry.title}
      </h2>
      <p className="text-theme-text-subtle dark:text-theme-text-subtle light:text-theme-light-text-subtle">
        {post.entry.description}
      </p>
      <div className="flex items-center gap-2 pt-2">
        {post.entry.tags.map((tag) => (
          <div
            key={`${post.slug}-${tag}`}
            className="border border-theme-primary/30 dark:border-theme-primary/30 light:border-theme-light-primary/30 rounded-md py-0.5 px-2 text-theme-text-subtle dark:text-theme-text-subtle light:text-theme-light-text-subtle text-sm capitalize"
          >
            {tag?.replace('-', ' ')}
          </div>
        ))}
      </div>
    </Link>
  )
}
