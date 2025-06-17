import { Link, NavLink } from '@remix-run/react'
import { cn } from '~/lib/utils'
import ThemeToggle from '~/components/ThemeToggle'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <header className="w-full flex justify-between items-center px-4 py-2 border-b border-theme-primary/20 dark:border-theme-primary/20 light:border-theme-light-primary/20">
        <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
          <Link to="/" className="font-extrabold">
            KB
          </Link>
          <nav className="flex items-center gap-4">
            <NavLink
              to="/life"
              className={({ isActive }) =>
                cn(
                  'border-b-2 transition-colors',
                  isActive
                    ? 'border-b-theme-primary dark:border-b-theme-primary light:border-b-theme-light-primary'
                    : 'border-b-transparent hover:border-b-theme-primary/50 dark:hover:border-b-theme-primary/50 light:hover:border-b-theme-light-primary/50'
                )
              }
            >
              Life
            </NavLink>
            <NavLink
              to="/software"
              className={({ isActive }) =>
                cn(
                  'border-b-2 transition-colors',
                  isActive
                    ? 'border-b-theme-primary dark:border-b-theme-primary light:border-b-theme-light-primary'
                    : 'border-b-transparent hover:border-b-theme-primary/50 dark:hover:border-b-theme-primary/50 light:hover:border-b-theme-light-primary/50'
                )
              }
            >
              Software
            </NavLink>
            <NavLink
              to="/blog"
              className={({ isActive }) =>
                cn(
                  'border-b-2 transition-colors',
                  isActive
                    ? 'border-b-theme-primary dark:border-b-theme-primary light:border-b-theme-light-primary'
                    : 'border-b-transparent hover:border-b-theme-primary/50 dark:hover:border-b-theme-primary/50 light:hover:border-b-theme-light-primary/50'
                )
              }
            >
              Blog
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                cn(
                  'border-b-2 hidden md:block transition-colors',
                  isActive
                    ? 'border-b-theme-primary dark:border-b-theme-primary light:border-b-theme-light-primary'
                    : 'border-b-transparent hover:border-b-theme-primary/50 dark:hover:border-b-theme-primary/50 light:hover:border-b-theme-light-primary/50'
                )
              }
            >
              Indie Projects
            </NavLink>
          </nav>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="w-full px-4 pb-2 md:px-5 md:pb-5 overflow-x-clip min-h-[calc(100vh-42px)] flex flex-col">
        {children}
      </main>
      <footer className="mt-auto border-t border-theme-primary/20 dark:border-theme-primary/20 light:border-theme-light-primary/20 py-4 px-4">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div className="text-sm text-theme-text-subtle dark:text-theme-text-subtle light:text-theme-light-text-subtle">
            © {new Date().getFullYear()} Kellen Busby
          </div>
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </>
  )
}
