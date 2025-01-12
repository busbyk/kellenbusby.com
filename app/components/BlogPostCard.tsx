import { Link } from '@remix-run/react'
import classNames from 'classnames'
import { PostMeta } from '~/lib/posts'

export default function BlogPostCard({
  className,
  postMeta,
}: {
  className?: string
  postMeta: PostMeta
}) {
  const tags = postMeta.frontmatter.tags?.split(',')

  return (
    <Link
      to={`/blog/${postMeta.slug}`}
      className={classNames(
        className,
        'rounded-md hover:border-b-white border-b-transparent border-b outline p-4'
      )}
    >
      <h2 className="text-xl font-bold">{postMeta.frontmatter.title}</h2>
      <p className="">{postMeta.frontmatter.description}</p>
      <div className="flex items-center gap-2 pt-2">
        {tags.map((tag) => (
          <div className="border rounded-md py-0.5 px-2 text-theme-white/80 text-sm capitalize">
            {tag}
          </div>
        ))}
      </div>
    </Link>
  )
}
