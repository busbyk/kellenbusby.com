import { cn } from '~/lib/utils'

export default function Service({
  title,
  description,
  className,
}: {
  title: string
  description: string
  className?: string
}) {
  return (
    <div
      className={cn(
        className,
        'flex flex-col border-t border-theme-primary/20 dark:border-theme-primary/20 light:border-theme-light-primary/20 pt-4 px-4'
      )}
    >
      <p className="font-bold text-lg text-theme-text dark:text-theme-text light:text-theme-light-text">
        {title}
      </p>
      <div className="h-0.5 rounded-full bg-theme-primary/50 dark:bg-theme-primary/50 light:bg-theme-light-primary/50 w-1/4 my-2" />
      <p className="text-justify text-theme-text-subtle dark:text-theme-text-subtle light:text-theme-light-text-subtle">
        {description}
      </p>
    </div>
  )
}
