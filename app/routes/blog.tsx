import { Link, MetaFunction, Outlet } from '@remix-run/react'
import PageLayout from '~/components/layout/PageLayout'

export const meta: MetaFunction = () => {
  return [{ title: "Kellen Busby's Blog" }]
}

export default function Blog() {
  return (
    <PageLayout>
      <Link
        to="/blog"
        className="w-fit underline hover:no-underline underline-offset-4 -mt-6 md:-mt-14"
      >
        {'< '}Back
      </Link>
      <Outlet />
    </PageLayout>
  )
}
