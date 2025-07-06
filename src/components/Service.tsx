import { cn } from '@/utils'

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
    <div className={cn(className, 'flex flex-col border-t pt-4 px-4')}>
      <p className="font-bold text-lg">{title}</p>
      <div className="h-0.5 rounded-full bg-theme-white w-1/4 my-2" />
      <p className="text-justify">{description}</p>
    </div>
  )
}
