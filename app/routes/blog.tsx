import { Outlet } from '@remix-run/react'

export default function Blog() {
  return (
    <div className="pt-8 flex flex-col items-center">
      <div className="max-w-6xl flex flex-col prose prose-invert">
        <Outlet />
      </div>
    </div>
  )
}
