import BlogPostCard from '@/components/BlogPostCard'
import PageLayout from '@/components/layout/PageLayout'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
  })

  return (
    <PageLayout heading="Blog" className="flex-grow">
      <div className="grid md:grid-cols-2">
        {posts.docs.map((post) => (
          <BlogPostCard post={post} key={post.id} />
        ))}
      </div>
    </PageLayout>
  )
}
