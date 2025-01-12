import { Outlet } from '@remix-run/react'

export default function Blog() {
  return (
    <div className="py-8 flex flex-col items-center">
      <div className="max-w-4xl flex flex-col prose prose-invert prose-li:marker:text-white prose-p:my-2 prose-headings:my-4 prose-li:my-0.5 prose-h1:mb-8 prose-h1:text-4xl md:prose-h1:text-5xl text-theme-white prose-figure:my-2">
        <Outlet />
      </div>
    </div>
  )
}
