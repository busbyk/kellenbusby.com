import { Post } from '@/payload-types'
import { cn } from '@/utils'
import { format } from 'date-fns'
import Link from 'next/link'
import { ImageMedia } from './Media/ImageMedia'

export default function BlogPostCard({ post, className }: { post: Post; className?: string }) {
  return (
    <Link key={post.id} href={`/blog/${post.slug}`}>
      <div className={cn('group flex flex-col items-stretch flex-grow cursor-pointer', className)}>
        <ImageMedia
          resource={post.image}
          pictureClassName="rounded-t-md overflow-hidden w-full h-64"
          imgClassName="object-cover object-center w-full h-full scale-105 group-hover:scale-100 transition-transform duration-300 ease-in-out"
        />
        <div className="border-border rounded-b-md p-5 bg-card text-card-foreground group-hover:bg-card/80 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl">{post.title}</h2>
            <p className="text-muted text-sm">
              Last Updated: {format(new Date(post.updatedAt), 'PPP')}
            </p>
          </div>
          <div className="border rounded px-2 py-0.5 w-fit text-sm text-muted">
            #{post.tags?.map((tag) => typeof tag !== 'number' && tag.name.toLowerCase())}
          </div>
        </div>
      </div>
    </Link>
  )
}
