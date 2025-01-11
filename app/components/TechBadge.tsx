import classNames from 'classnames'
import { ExternalLink } from 'lucide-react'
import { ReactNode } from 'react'

export default function TechBadge({
  children,
  icon,
  href,
  className,
}: {
  children: ReactNode
  icon?: ReactNode
  href?: string
  className?: string
}) {
  const Badge = (
    <div className="relative group">
      <div
        className={classNames(
          'bg-slate-900 py-1.5 rounded-full flex items-center',
          icon && 'pl-1.5 pr-4 gap-2',
          !icon && 'px-4',
          className
        )}
      >
        <figure
          className={classNames(
            'flex items-center justify-center h-8',
            icon && 'w-8 rounded-full bg-black p-0.5',
            !icon && 'w-0'
          )}
        >
          {icon}
        </figure>
        {children}
      </div>
      {href && (
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 translate-x-0 translate-y-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500">
          <ExternalLink className="h-4 w-4 shrink-0" />
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <a href={href} target="_blank">
        {Badge}
      </a>
    )
  }

  return Badge
}
