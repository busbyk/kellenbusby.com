import type { MetaFunction } from '@remix-run/node'
import contra from '../images/contra-circle.svg'
import github from '../images/github-circle.svg'
import linkedin from '../images/linkedin-circle.svg'
import instagram from '../images/instagram-circle.svg'
import twitter from '../images/twitter-circle.svg'
import youtube from '../images/youtube-circle.svg'
import CaretRightIcon from '~/components/icons/CaretRightIcon'
import softwareHeadshot from '../images/software-headshot.webp'
import outdoorsHeadshot from '../images/outdoors-headshot.webp'
import { ProfileContainer } from '../components/ProfileContainer'
import { useEffect, useState } from 'react'
import classNames from 'classnames'
import { useHover } from '~/hooks/useHover'
import { Link } from '@remix-run/react'

export function headers() {
  return {
    'cache-control':
      'max-age=1, s-maxage=604800, stale-while-revalidate=31536000',
  }
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Kellen Busby' },
    {
      name: 'description',
      content:
        'Full stack software engineer specializing in web app development for startups, small businesses, and unique projects.',
    },
    {
      tagName: 'link',
      rel: 'canonical',
      href: 'https://www.kellenbusby.com/',
    },
  ]
}

export default function Index() {
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
    <div className="flex flex-col gap-2 md:gap-8 flex-grow w-full justify-center items-center h-full">
      <h1 className="text-5xl md:text-7xl font-extrabold text-center">
        Kellen Busby
      </h1>
      <figure className="relative h-36 md:h-56 w-full -mb-4 overflow-hidden">
        <img
          src={softwareHeadshot}
          alt="Kellen Busby software engineer"
          width={192}
          height={192}
          className={classNames(
            'absolute inset-0 mx-auto my-auto rounded-full w-32 md:w-48 shadow-lg motion-reduce:duration-[0s]rotate-90 transition duration-1000 motion-reduce:duration-[0s]',
            profile === 'outdoors' && 'md:-rotate-90 md:opacity-0',
            profile === 'software' && 'md:rotate-0 md:opacity-100',
          )}
          style={{ transformOrigin: '50% 300px' }}
          loading="eager"
        />
        <img
          src={outdoorsHeadshot}
          alt="Kellen Busby outdoors person"
          width={192}
          height={192}
          className={classNames(
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
          to="/software"
          className="slide-in-background-from-right relative overflow-hidden flex flex-1 flex-col flex-grow md:gap-1 justify-center items-center md:items-end rounded-md md:h-48 p-4"
          ref={softwareLinkRef}
        >
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">
            Software Engineer
          </h2>
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">
            Web App Dev
          </h2>
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">
            JS|TS|React Dev
          </h2>
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">
            Remix.run Dev
          </h2>
          <button className="md:hidden mt-3 pl-4 pr-2 py-1.5 rounded-md border-2 border-theme-white flex items-center gap-1">
            Software <CaretRightIcon />
          </button>
        </Link>
        <div className="bg-theme-white h-px w-42 md:h-44 md:w-1" />
        <Link
          to="/life"
          className="slide-in-background-from-left relative overflow-hidden flex flex-1 flex-col flex-grow md:gap-1 justify-center items-center md:items-start rounded-md md:h-60 p-4"
          ref={outdoorsLinkRef}
        >
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">
            Skier
          </h2>
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">
            Climber
          </h2>
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">
            Mountain Biker
          </h2>
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">
            Traveler
          </h2>
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">
            Hobbyist
          </h2>
          <button className="md:hidden mt-3 pl-4 pr-2 py-1.5 rounded-md border-2 border-theme-white flex items-center gap-1">
            Life <CaretRightIcon />
          </button>
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-xs uppercase">Profiles</h2>
        <div className="flex gap-2">
          <ProfileContainer
            href="https://www.contra.com/kellenbusby/?utm_source=kellenbusby.com"
            tooltip="Contra | kellenbusby"
          >
            <img src={contra} alt="contra logo" width={48} height={48} />
          </ProfileContainer>
          <ProfileContainer
            href="https://github.com/busbyk"
            tooltip="GitHub | busbyk"
          >
            <img src={github} alt="github logo" width={48} height={48} />
          </ProfileContainer>
          <ProfileContainer
            href="https://www.instagram.com/kellenbusby"
            tooltip="Instagram | kellenbusby"
          >
            <img src={instagram} alt="instagram logo" width={48} height={48} />
          </ProfileContainer>
          <ProfileContainer
            href="https://www.linkedin.com/services/page/940755311278b0742a/"
            tooltip="LinkedIn | Kellen Busby Software"
          >
            <img src={linkedin} alt="linkedin logo" width={48} height={48} />
          </ProfileContainer>
          <ProfileContainer
            href="https://twitter.com/kellenbusbydev"
            tooltip="Twitter | @kellenbusbydev"
          >
            <img src={twitter} alt="twitter logo" width={48} height={48} />
          </ProfileContainer>
          <ProfileContainer
            href="https://www.youtube.com/channel/UCq4RGdMw9cCuFUsVXoXMkTQ"
            tooltip="YouTube | @kellenbusby"
          >
            <img src={youtube} alt="youtube logo" width={48} height={48} />
          </ProfileContainer>
        </div>
      </div>
    </div>
  )
}
