import { cn } from '@/utils'
import { Children, cloneElement, isValidElement, ReactElement } from 'react'

export default function SlideInBackground({
  children,
  direction = 'ltr',
}: {
  children: React.ReactNode
  direction?: 'ltr' | 'rtl'
}) {
  const childrenArray = Children.toArray(children)
  const firstChild = childrenArray[0]

  if (!isValidElement(firstChild)) {
    console.warn('SlideInBackground: First child must be a valid React element')
    return <>{children}</>
  }

  // Type guard to ensure firstChild is a ReactElement with props
  const element = firstChild as ReactElement<{ className?: string; children?: React.ReactNode }>

  // Clone the first child and add the group class
  const clonedChild = cloneElement(element, {
    ...element.props,
    className: cn(element.props.className, 'group'),
    children: (
      <>
        {element.props.children}
        <div
          className={cn(
            'hidden md:block bg-theme-blue absolute inset-0 rounded-md group-hover:translate-x-0 transition-transform duration-500 ease-in-out z-[-1]',
            direction === 'ltr' ? '-translate-x-[110%]' : 'translate-x-[110%]',
          )}
        />
      </>
    ),
  })

  // Return the cloned first child with the sliding background, plus any remaining children
  return (
    <>
      {clonedChild}
      {childrenArray.slice(1)}
    </>
  )
}
