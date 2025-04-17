import { Link } from '@remix-run/react'
import { cn } from '~/lib/utils'

export default function ProjectPostCard({
  className,
  title,
  tagline,
  date,
  to,
  href,
}: {
  className?: string
  title: string
  tagline: string
  date?: string
  to?: string
  href?: string
}) {
  const Card = (
    <div
      className={cn(
        'group flex items-stretch flex-grow cursor-pointer',
        className
      )}
    >
      <div className="px-3 py-2 bg-theme-bg-surface rounded-l-md">
        <p className="font-bold text-lg">{title}</p>
        <p>{tagline}</p>
        {date && <p className="text-xs text-theme-text-subtle">{date}</p>}
      </div>
      <div className="flex items-center justify-center bg-theme-primary rounded-r-md px-px group-hover:bg-theme-primary-light transition-colors duration-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"></path>
        </svg>
      </div>
    </div>
  )

  if (href) {
    return <a href={href}>{Card}</a>
  }

  if (to) {
    return <Link to={to}>{Card}</Link>
  }

  return Card
}
