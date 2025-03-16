import { cn } from '~/lib/utils'
import React from 'react'

export default function PageLayout({
  children,
  className,
  heading,
}: {
  children: React.ReactNode
  className?: string
  heading?: React.ReactNode
}) {
  return (
    <div className={cn('py-12 md:py-20 flex flex-col items-center', className)}>
      <div className="w-full max-w-4xl flex flex-col gap-6 mx-auto">
        {heading && (
          <h1 className="text-4xl md:text-6xl font-extrabold">{heading}</h1>
        )}
        {children}
      </div>
    </div>
  )
}
