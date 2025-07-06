import Link from 'next/link'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="w-full flex justify-between items-center px-4 py-2">
        <div className="flex gap-8 items-center justify-between md:justify-normal w-full max-w-4xl">
          <Link href="/" className="font-extrabold">
            KB
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/life">Life</Link>
            <Link href="/software">Software</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/projects">Projects</Link>
          </div>
        </div>
      </header>
      <main className="w-full px-4 pb-2 md:px-5 md:pb-5 overflow-x-clip min-h-[calc(100vh-42px)] flex flex-col">
        {children}
      </main>
    </>
  )
}
