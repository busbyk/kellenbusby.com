import { Link } from '@remix-run/react'
import classNames from 'classnames'

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
      className={classNames(
        'px-3 py-2 bg-slate-900 rounded-r-md',
        className,
        (to || href) &&
          'border-l-8 border-l-theme-purple-default cursor-pointer hover:shadow-md hover:border-l-theme-purple-light'
      )}
    >
      <p className="font-bold text-lg">{title}</p>
      <p>{tagline}</p>
      {date && <p className="text-xs text-theme-white/70">{date}</p>}
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
