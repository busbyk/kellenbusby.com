'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils'

export default function NavLinks() {
  const pathname = usePathname()

  const links = [
    { href: '/life', label: 'Life' },
    { href: '/software', label: 'Software' },
    { href: '/blog', label: 'Blog' },
    { href: '/projects', label: 'Projects' },
  ]

  return (
    <div className="flex items-center sm:gap-2">
      {links.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'group relative px-2 sm:px-4 py-1 font-medium transition-colors duration-200',
            )}
          >
            {link.label}
            <span
              className={cn(
                'absolute bottom-0 left-0 right-0 mx-auto h-0.5 bg-accent transition-all duration-300 ease-out',
                isActive ? 'w-4/5' : 'w-0 group-hover:w-4/5',
              )}
            />
          </Link>
        )
      })}
    </div>
  )
}
