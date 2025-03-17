import { Link, NavLink } from '@remix-run/react'
import classNames from 'classnames'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <header className="w-full flex justify-between items-center px-4 py-2">
        <div className="flex gap-8 items-center justify-between md:justify-normal w-full max-w-6xl mx-auto">
          <Link to="/" className="font-extrabold">
            KB
          </Link>
          <div className="flex items-center gap-4">
            <NavLink
              to="/life"
              className={({ isActive }) =>
                classNames(
                  'border-b-2',
                  isActive && 'border-b-theme-white',
                  !isActive && 'border-b-transparent'
                )
              }
            >
              Life
            </NavLink>
            <NavLink
              to="/software"
              className={({ isActive }) =>
                classNames(
                  'border-b-2',
                  isActive && 'border-b-theme-white',
                  !isActive && 'border-b-transparent'
                )
              }
            >
              Software
            </NavLink>
            <NavLink
              to="/blog"
              className={({ isActive }) =>
                classNames(
                  'border-b-2',
                  isActive && 'border-b-theme-white',
                  !isActive && 'border-b-transparent'
                )
              }
            >
              Blog
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                classNames(
                  'border-b-2 hidden md:block',
                  isActive && 'border-b-theme-white',
                  !isActive && 'border-b-transparent'
                )
              }
            >
              Indie Projects
            </NavLink>
          </div>
        </div>
      </header>
      <main className="w-full px-4 pb-2 md:px-5 md:pb-5 overflow-x-clip min-h-[calc(100vh-42px)] flex flex-col">
        {children}
      </main>
    </>
  )
}
