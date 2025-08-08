'use client'

import { Post } from '@/payload-types'
import { cn } from '@/utils'
import { format } from 'date-fns'
import Link from 'next/link'
import { ImageMedia } from './Media/ImageMedia'

export default function BlogPostCard({ post, className }: { post: Post; className?: string }) {
  return (
    <div className={cn('group flex flex-col items-stretch flex-grow', className)}>
      <Link href={`/blog/${post.slug}`} className="cursor-pointer">
        <ImageMedia
          resource={post.image}
          pictureClassName="rounded-t-md overflow-hidden w-full h-64"
          imgClassName="object-cover object-center w-full h-full scale-105 group-hover:scale-100 transition-transform duration-300 ease-in-out"
        />
      </Link>
      <div className="border-border rounded-b-md p-5 bg-card text-card-foreground group-hover:bg-card/80 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <Link href={`/blog/${post.slug}`}>
            <h2 className="text-2xl hover:text-primary transition-colors">{post.title}</h2>
          </Link>
          <p className="text-muted text-sm">
            Last Updated: {format(new Date(post.updatedAt), 'PPP')}
          </p>
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => {
              if (typeof tag === 'number') return null
              return (
                <Link
                  key={tag.id}
                  href={`/blog/tags/${tag.slug}`}
                  className="border rounded px-2 py-0.5 text-sm text-muted hover:text-primary hover:border-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  #{tag.name.toLowerCase()}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
