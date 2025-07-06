import Link from 'next/link'
import DarkModeToggle from '../DarkModeToggle.client'
import NavLinks from '../NavLinks.client'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="h-[57px]" />
      <main className="w-full px-4 pb-2 md:px-5 md:pb-5 overflow-x-clip min-h-[calc(100vh-42px)] flex flex-col">
        {children}
      </main>
      <header className="fixed top-0 inset-x-0 bg-background border-b border-border py-3 px-4">
        <div className="flex gap-8 items-center justify-between w-full max-w-4xl mx-auto">
          <Link href="/" className="font-extrabold text-xl">
            KB
          </Link>
          <NavLinks />
          <div className="flex items-center">
            <DarkModeToggle />
          </div>
        </div>
      </header>
    </>
  )
}
