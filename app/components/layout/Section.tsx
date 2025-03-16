import { cn } from '~/lib/utils'

export default function Section({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('max-w-4xl flex flex-col gap-6', className)}>
      {children}
    </section>
  )
}
