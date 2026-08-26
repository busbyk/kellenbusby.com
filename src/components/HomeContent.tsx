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
  // Intro rides the same swing-arc transition as the hover flip: both
  // headshots swing in from behind their texts, cross slightly past center,
  // then outdoors settles on top and software swings back behind its text.
  const [stage, setStage] = useState<'hidden' | 'enter' | 'done'>('hidden')
  const profile: Mode = hovered ?? 'outdoors'

  const activate = (mode: Mode) => {
    setHovered(mode)
    document.documentElement.dataset.profile = mode
  }

  useEffect(() => {
    const enter = setTimeout(() => setStage('enter'), 80)
    // Fire while the swing-in is still finishing so the return redirects
    // mid-flight instead of pausing at the crossed pose
    const settle = setTimeout(() => setStage('done'), 950)
    return () => {
      clearTimeout(enter)
      clearTimeout(settle)
    }
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
      <h1 className="whitespace-nowrap text-[clamp(2.25rem,11vw,3rem)] md:text-7xl font-extrabold text-center">
        Kellen Busby
      </h1>
      <figure className="hidden md:block relative h-56 w-full -mb-4 overflow-hidden">
        <img
          src={softwareHeadshot.src}
          alt="Kellen Busby software engineer"
          width={192}
          height={192}
          className={cn(
            'absolute inset-0 mx-auto my-auto rounded-full w-32 md:w-48 shadow-lg motion-reduce:duration-[0s] transition duration-1000',
            stage === 'hidden' && '-rotate-90 opacity-0',
            stage === 'enter' && 'rotate-6 opacity-100',
            stage === 'done' &&
              (profile === 'software'
                ? 'rotate-0 opacity-100'
                : '-rotate-90 opacity-0'),
          )}
          style={{ transformOrigin: '50% 300px' }}
        />
        <img
          src={outdoorsHeadshot.src}
          alt="Kellen Busby outdoors person"
          width={192}
          height={192}
          className={cn(
            'absolute inset-0 z-10 mx-auto my-auto rounded-full w-32 md:w-48 shadow-lg motion-reduce:duration-[0s] transition duration-1000',
            stage === 'hidden' && 'rotate-90 opacity-0',
            stage === 'enter' && '-rotate-12 opacity-100',
            stage === 'done' &&
              (profile === 'outdoors'
                ? 'rotate-0 opacity-100'
                : 'rotate-90 opacity-0'),
          )}
          style={{ transformOrigin: '50% 300px' }}
        />
      </figure>
      <div className="flex flex-col items-center md:flex-row md:items-center md:justify-center md:gap-8">
        <a
          href="/software"
          className={cn(
            'flex flex-row items-center justify-center gap-5 md:flex-col md:items-end md:gap-0.5 rounded-md p-4 transition-opacity duration-500',
            hovered === 'outdoors' && 'md:opacity-40',
          )}
          onMouseEnter={() => activate('software')}
        >
          <div className="intro-side-left flex flex-col items-center gap-2.5 md:hidden">
            <img
              src={softwareHeadshot.src}
              alt="Kellen Busby software engineer"
              width={80}
              height={80}
              className="w-20 rounded-full shadow-lg"
            />
            <button className="pl-4 pr-2 py-1.5 rounded-md border-2 border-foreground/20 flex items-center gap-1 text-sm">
              Software <CaretRightIcon />
            </button>
          </div>
          <div className="flex flex-col items-start md:items-end md:gap-0.5">
            <h2 className="text-lg md:text-2xl font-bold whitespace-nowrap">
              Software Engineer
            </h2>
            <h2 className="text-lg md:text-2xl font-bold whitespace-nowrap">
              Web App Dev
            </h2>
            <h2 className="text-lg md:text-2xl font-bold whitespace-nowrap">
              JS|TS|React Dev
            </h2>
          </div>
        </a>
        <div
          className={cn(
            'hidden md:block bg-foreground/20 md:h-28 md:w-1 transition-transform duration-500',
            hovered === 'software' && 'md:translate-x-3',
            hovered === 'outdoors' && 'md:-translate-x-3',
          )}
        />
        <a
          href="/life"
          className={cn(
            'flex flex-row-reverse items-center justify-center gap-5 md:flex-col md:items-start md:gap-0.5 rounded-md p-4 transition-opacity duration-500',
            hovered === 'software' && 'md:opacity-40',
          )}
          onMouseEnter={() => activate('outdoors')}
        >
          <div className="intro-side-right flex flex-col items-center gap-2.5 md:hidden">
            <img
              src={outdoorsHeadshot.src}
              alt="Kellen Busby outdoors person"
              width={80}
              height={80}
              className="w-20 rounded-full shadow-lg"
            />
            <button className="pl-4 pr-2 py-1.5 rounded-md border-2 border-foreground/20 flex items-center gap-1 text-sm">
              Life <CaretRightIcon />
            </button>
          </div>
          <div className="flex flex-col items-start md:gap-0.5">
            <h2 className="md:hidden text-lg font-bold text-balance">
              Skier, Climber, Mountain Biker, Traveler, Hobbyist
            </h2>
            <h2 className="hidden md:block text-lg md:text-2xl font-bold whitespace-nowrap">
              Skier
            </h2>
            <h2 className="hidden md:block text-lg md:text-2xl font-bold whitespace-nowrap">
              Climber
            </h2>
            <h2 className="hidden md:block text-lg md:text-2xl font-bold whitespace-nowrap">
              Mountain Biker
            </h2>
            <h2 className="hidden md:block text-lg md:text-2xl font-bold whitespace-nowrap">
              Traveler
            </h2>
            <h2 className="hidden md:block text-lg md:text-2xl font-bold whitespace-nowrap">
              Hobbyist
            </h2>
          </div>
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
