import { useEffect, useState } from 'preact/hooks'
import { ProfileContainer } from './ProfileContainer'
import CaretRightIcon from './CaretRightIcon'
import { cn } from '../lib/utils'

// Import images
import softwareHeadshot from '../assets/software-headshot.webp'
import outdoorsHeadshot from '../assets/outdoors-headshot.webp'
import ContraCircleIcon from './icons/ContraCircleIcon'
import GithubCircleIcon from './icons/GithubCircleIcon'
import LinkedinCircleIcon from './icons/LinkedinCircleIcon'
import InstagramCircleIcon from './icons/InstagramCircleIcon'
import TwitterCircleIcon from './icons/TwitterCircleIcon'
import YoutubeCircleIcon from './icons/YoutubeCircleIcon'

type Mode = 'software' | 'outdoors'

export default function HomeContent() {
  // null until the first hover so the page starts neutral
  const [hovered, setHovered] = useState<Mode | null>(null)
  const [introDone, setIntroDone] = useState(false)
  const profile: Mode = hovered ?? 'software'

  const activate = (mode: Mode) => {
    setHovered(mode)
    document.documentElement.dataset.profile = mode
  }

  // Let the intro animation finish before the outdoors headshot tucks away
  useEffect(() => {
    const timer = setTimeout(() => setIntroDone(true), 1250)
    return () => clearTimeout(timer)
  }, [])

  // Hovering the content sections below the hero also switches context
  useEffect(() => {
    const cols = Array.from(document.querySelectorAll('[data-col]'))
    const cleanups = cols.map((col) => {
      const mode: Mode =
        col.getAttribute('data-col') === 'outdoors' ? 'outdoors' : 'software'
      const onEnter = () => activate(mode)
      col.addEventListener('mouseenter', onEnter)
      return () => col.removeEventListener('mouseenter', onEnter)
    })
    return () => cleanups.forEach((fn) => fn())
  }, [])

  return (
    <div className="flex flex-col gap-2 md:gap-6 grow w-full justify-center items-center h-full pt-4">
      <h1 className="text-5xl md:text-7xl font-extrabold text-center">
        Kellen Busby
      </h1>
      <figure className="relative h-36 md:h-56 w-full -mb-4 overflow-hidden">
        <div className="intro-headshot-left absolute inset-0 z-10 pointer-events-none">
          <img
            src={softwareHeadshot.src}
            alt="Kellen Busby software engineer"
            width={192}
            height={192}
            className={cn(
              'absolute inset-0 mx-auto my-auto rounded-full w-32 md:w-48 shadow-lg motion-reduce:duration-[0s] transition duration-1000',
              profile === 'outdoors' && 'md:-rotate-90 md:opacity-0',
              profile === 'software' && 'md:rotate-0 md:opacity-100',
            )}
            style={{ transformOrigin: '50% 300px' }}
          />
        </div>
        <div className="intro-headshot-right absolute inset-0 pointer-events-none">
          <img
            src={outdoorsHeadshot.src}
            alt="Kellen Busby outdoors person"
            width={192}
            height={192}
            className={cn(
              'hidden md:block absolute inset-0 mx-auto my-auto rounded-full w-32 md:w-48 shadow-lg motion-reduce:duration-[0s] transition duration-1000',
              !introDone
                ? 'rotate-0 opacity-100'
                : profile === 'outdoors'
                  ? 'rotate-0 opacity-100'
                  : 'rotate-90 opacity-0',
            )}
            style={{ transformOrigin: '50% 300px' }}
          />
        </div>
      </figure>
      <div className="flex flex-col items-center md:flex-row md:items-center md:justify-center md:gap-8">
        <a
          href="/software"
          className={cn(
            'flex flex-col items-center md:items-end rounded-md p-4 md:gap-0.5 transition-opacity duration-500',
            hovered === 'outdoors' && 'md:opacity-40',
          )}
          onMouseEnter={() => activate('software')}
        >
          <h2 className="text-lg md:text-2xl font-bold whitespace-nowrap">
            Software Engineer
          </h2>
          <h2 className="text-lg md:text-2xl font-bold whitespace-nowrap">
            Web App Dev
          </h2>
          <h2 className="text-lg md:text-2xl font-bold whitespace-nowrap">
            JS|TS|React Dev
          </h2>
          <button className="md:hidden mt-3 pl-4 pr-2 py-1.5 rounded-md border-2 border-foreground/20 flex items-center gap-1">
            Software <CaretRightIcon />
          </button>
        </a>
        <div
          className={cn(
            'bg-foreground/20 h-px w-42 md:h-28 md:w-1 transition-transform duration-500',
            hovered === 'software' && 'md:translate-x-3',
            hovered === 'outdoors' && 'md:-translate-x-3',
          )}
        />
        <a
          href="/life"
          className={cn(
            'flex flex-col items-center md:items-start rounded-md p-4 md:gap-0.5 transition-opacity duration-500',
            hovered === 'software' && 'md:opacity-40',
          )}
          onMouseEnter={() => activate('outdoors')}
        >
          <h2 className="text-lg md:text-2xl font-bold whitespace-nowrap">
            Skier
          </h2>
          <h2 className="text-lg md:text-2xl font-bold whitespace-nowrap">
            Climber
          </h2>
          <h2 className="text-lg md:text-2xl font-bold whitespace-nowrap">
            Mountain Biker
          </h2>
          <h2 className="text-lg md:text-2xl font-bold whitespace-nowrap">
            Traveler
          </h2>
          <h2 className="text-lg md:text-2xl font-bold whitespace-nowrap">
            Hobbyist
          </h2>
          <button className="md:hidden mt-3 pl-4 pr-2 py-1.5 rounded-md border-2 border-foreground/20 flex items-center gap-1">
            Life <CaretRightIcon />
          </button>
        </a>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-xs uppercase">Profiles</h2>
        <div className="flex gap-2">
          <ProfileContainer
            href="https://www.contra.com/kellenbusby/?utm_source=kellenbusby.com"
            tooltip="Contra | kellenbusby"
          >
            <ContraCircleIcon />
          </ProfileContainer>
          <ProfileContainer
            href="https://github.com/busbyk"
            tooltip="GitHub | busbyk"
          >
            <GithubCircleIcon />
          </ProfileContainer>
          <ProfileContainer
            href="https://www.instagram.com/kellenbusby"
            tooltip="Instagram | kellenbusby"
          >
            <InstagramCircleIcon />
          </ProfileContainer>
          <ProfileContainer
            href="https://www.linkedin.com/services/page/940755311278b0742a/"
            tooltip="LinkedIn | Kellen Busby Software"
          >
            <LinkedinCircleIcon />
          </ProfileContainer>
          <ProfileContainer
            href="https://twitter.com/kellenbusbydev"
            tooltip="Twitter | @kellenbusbydev"
          >
            <TwitterCircleIcon />
          </ProfileContainer>
          <ProfileContainer
            href="https://www.youtube.com/channel/UCq4RGdMw9cCuFUsVXoXMkTQ"
            tooltip="YouTube | @kellenbusby"
          >
            <YoutubeCircleIcon />
          </ProfileContainer>
        </div>
      </div>
    </div>
  )
}
