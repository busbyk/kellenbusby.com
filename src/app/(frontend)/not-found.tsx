import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex justify-center items-center flex-col gap-6 flex-grow">
      <h1 className="text-4xl font-bold">
        404 <span className="text-xl font-normal">Page Not Found</span>
      </h1>
      <p className="text-lg">This page could not be found.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Go home
      </Link>
    </div>
  )
}
