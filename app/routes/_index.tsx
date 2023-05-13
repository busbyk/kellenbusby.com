import type { V2_MetaFunction } from '@remix-run/node'
import contra from '../images/contra-circle.svg'
import github from '../images/github-circle.svg'
import linkedin from '../images/linkedin-circle.svg'
import instagram from '../images/instagram-circle.svg'
import twitter from '../images/twitter-circle.svg'
import youtube from '../images/youtube-circle.svg'
import CaretRightIcon from '~/components/icons/CaretRightIcon'

export const meta: V2_MetaFunction = () => {
  return [
    { title: 'Kellen Busby' },
    {
      name: 'description',
      content:
        "Full stack software engineer specializing in web app development for startups, small businesses, and unique projects. I'm also a lover of the outdoors and mountain sports.",
    },
  ]
}

export default function Index() {
  return (
    <div className="flex flex-col gap-8 flex-grow w-full justify-center items-center">
      <h1 className="text-5xl md:text-7xl font-extrabold text-center">
        Kellen Busby
      </h1>
      <div className="flex flex-col md:min-w-[800px] md:flex-row md:items-center gap-4 md:gap-8">
        <a
          href="https://www.contra.com/kellenbusby"
          className="slide-in-background-from-right relative overflow-hidden flex flex-1 flex-col flex-grow md:gap-1 justify-center items-center md:items-end rounded-md md:h-48 p-4"
        >
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">
            Software Engineer
          </h2>
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">
            Web App Dev
          </h2>
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">
            Lover of Remix
          </h2>
          <button className="md:hidden mt-3 pl-4 pr-2 py-1.5 rounded-md border-2 border-theme-white flex items-center gap-1">
            Software <CaretRightIcon />
          </button>
        </a>
        <div className="bg-theme-white h-px w-42 md:h-44 md:w-1" />
        <a
          href="https://www.instagram.com/kellenbusby"
          className="slide-in-background-from-left relative overflow-hidden flex flex-1 flex-col flex-grow md:gap-1 justify-center items-center md:items-start rounded-md md:h-48 p-4"
        >
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">
            Skier
          </h2>
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">
            Climber
          </h2>
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">
            Mtn Biker
          </h2>
          <h2 className="text-xl md:text-4xl font-bold whitespace-nowrap">
            Mountain Lover
          </h2>
          <button className="md:hidden mt-3 pl-4 pr-2 py-1.5 rounded-md border-2 border-theme-white flex items-center gap-1">
            Outdoors <CaretRightIcon />
          </button>
        </a>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-xs uppercase">Profiles</h3>
        <div className="flex gap-2">
          <ProfileContainer
            href="https://www.contra.com/kellenbusby"
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

function ProfileContainer({
  href,
  children,
  tooltip,
}: {
  href: string
  children: React.ReactNode
  tooltip: string
}) {
  return (
    <a
      href={href}
      className="relative rounded-full h-10 w-10 md:h-12 md:w-12 flex justify-center items-center"
    >
      <div className="peer">{children}</div>
      <div className="absolute bottom-0 peer-hover:translate-y-[115%] opacity-0 peer-hover:opacity-100 transition-all duration-200 pointer-events-none">
        <span className="whitespace-nowrap text-xs">{tooltip}</span>
      </div>
    </a>
  )
}
