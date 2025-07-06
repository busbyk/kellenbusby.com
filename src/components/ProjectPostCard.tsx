import { cn } from '@/utils'
import Link from 'next/link'

export default function ProjectPostCard({
  className,
  title,
  tagline,
  date,
  href,
}: {
  className?: string
  title: string
  tagline: string
  date?: string
  href?: string
}) {
  const Card = (
    <div className={cn('group flex items-stretch flex-grow cursor-pointer', className)}>
      <div className="px-3 py-2 bg-slate-900 rounded-l-md">
        <p className="font-bold text-lg">{title}</p>
        <p>{tagline}</p>
        {date && <p className="text-xs text-theme-white/70">{date}</p>}
      </div>
      <div className="flex items-center justify-center bg-theme-purple-default rounded-r-md px-px group-hover:bg-theme-purple-light">
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
    return <Link href={href}>{Card}</Link>
  }

  return Card
}
