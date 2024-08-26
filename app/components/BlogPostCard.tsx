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
  return (
    <Link
      to={`/blog/${postMeta.slug}`}
      className={classNames(
        className,
        'rounded-md hover:border-b border-transparent hover:border-white outline p-4'
      )}
    >
      <h2 className="text-xl font-bold">{postMeta.frontmatter.title}</h2>
      <p className="">{postMeta.frontmatter.description}</p>
      <p className="text-sm text-gray-300">{postMeta.frontmatter.published}</p>
    </Link>
  )
}
