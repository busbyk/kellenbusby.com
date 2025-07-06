'use client'

import softwareHeadshot from '@/images/software-headshot.webp'
import outdoorsHeadshot from '@/images/outdoors-headshot.webp'
import { useEffect, useState } from 'react'
import { useHover } from '@/hooks/useHover'
import { cn } from '@/utils'
import Link from 'next/link'
import CaretRightIcon from '@/components/icons/CaretRightIcon'

export default function HomePageHero() {
  const [profile, setProfile] = useState<'software' | 'outdoors'>('software')

  const [softwareLinkRef, softwareHovered] = useHover<HTMLAnchorElement>()
  const [outdoorsLinkRef, outdoorsHovered] = useHover<HTMLAnchorElement>()

  useEffect(() => {
    if (softwareHovered) {
      setProfile('software')
    }
  }, [softwareHovered])
  useEffect(() => {
    if (outdoorsHovered) {
      setProfile('outdoors')
    }
  }, [outdoorsHovered])

  return (
    <div className="flex flex-col gap-2 md:gap-8 w-full justify-center items-center h-full">
      <figure className="relative h-36 md:h-56 w-full -mb-4 overflow-hidden">
        <img
          src={softwareHeadshot.src}
          alt="Kellen Busby software engineer"
          width={192}
          height={192}
          className={cn(
            'absolute inset-0 mx-auto my-auto rounded-full w-32 md:w-48 shadow-lg motion-reduce:duration-[0s]rotate-90 transition duration-1000 motion-reduce:duration-[0s]',
            profile === 'outdoors' && 'md:-rotate-90 md:opacity-0',
            profile === 'software' && 'md:rotate-0 md:opacity-100',
          )}
          style={{ transformOrigin: '50% 300px' }}
          loading="eager"
        />
        <img
          src={outdoorsHeadshot.src}
          alt="Kellen Busby outdoors person"
          width={192}
          height={192}
          className={cn(
            'hidden md:block absolute inset-0 mx-auto my-auto rounded-full w-32 md:w-48 shadow-lg motion-reduce:duration-[0s]rotate-90 transition duration-1000 motion-reduce:duration-[0s]',
            profile === 'software' && 'rotate-90 opacity-0',
            profile === 'outdoors' && 'rotate-0 opacity-100',
          )}
          style={{ transformOrigin: '50% 300px' }}
          loading="lazy"
        />
      </figure>
      <div className="flex flex-col md:min-w-[800px] md:flex-row md:items-center md:gap-8">
        <Link
          href="/software"
          className="group relative overflow-hidden flex flex-1 flex-col flex-grow md:gap-1 justify-center items-center md:items-end rounded-md md:h-48 p-4"
          ref={softwareLinkRef}
        >
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">Software Engineer</h2>
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">Web App Dev</h2>
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">JS|TS|React Dev</h2>
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">Remix.run Dev</h2>
          <button className="md:hidden mt-3 pl-4 pr-2 py-1.5 rounded-md border-2 border-border flex items-center gap-1 cursor-pointer group-hover:border-foreground">
            Software <CaretRightIcon />
          </button>
          <div className="hidden md:block bg-primary absolute inset-0 rounded-md translate-x-[110%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out z-[-1]" />
        </Link>
        <div className="bg-foreground mx-auto h-px w-44 md:h-44 md:w-1" />
        <Link
          href="/life"
          className="group relative overflow-hidden flex flex-1 flex-col flex-grow md:gap-1 justify-center items-center md:items-start rounded-md md:h-60 p-4"
          ref={outdoorsLinkRef}
        >
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">Skier</h2>
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">Climber</h2>
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">Mountain Biker</h2>
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">Traveler</h2>
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">Hobbyist</h2>
          <button className="md:hidden mt-3 pl-4 pr-2 py-1.5 rounded-md border-2 border-border flex items-center gap-1 cursor-pointer group-hover:border-foreground">
            Life <CaretRightIcon />
          </button>
          <div className="hidden md:block bg-primary absolute inset-0 rounded-md -translate-x-[110%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out z-[-1]" />
        </Link>
      </div>
    </div>
  )
}
