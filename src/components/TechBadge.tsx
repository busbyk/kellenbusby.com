import { cn } from '../lib/utils';
import type { ComponentChildren } from 'preact';

export default function TechBadge({
  children,
  icon,
  href,
  className,
}: {
  children: ComponentChildren;
  icon?: ComponentChildren;
  href?: string;
  className?: string;
}) {
  const Badge = (
    <div className="relative group">
      <div
        className={cn(
          'bg-card border py-1.5 rounded-full flex items-center',
          icon && 'pl-1.5 pr-4 gap-2',
          !icon && 'px-4',
          className
        )}
      >
        <figure
          className={cn(
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5 shrink-0"
          >
            <path d="M10 6V8H5V19H16V14H18V20C18 20.5523 17.5523 21 17 21H4C3.44772 21 3 20.5523 3 20V7C3 6.44772 3.44772 6 4 6H10ZM21 3V11H19L18.9999 6.413L11.2071 14.2071L9.79289 12.7929L17.5849 5H13V3H21Z"></path>
          </svg>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {Badge}
      </a>
    );
  }

  return Badge;
}
