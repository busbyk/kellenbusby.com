import { ProfileContainer } from '@/components/ProfileContainer'
import contra from '@/images/contra-circle.svg'
import github from '@/images/github-circle.svg'
import linkedin from '@/images/linkedin-circle.svg'
import instagram from '@/images/instagram-circle.svg'
import twitter from '@/images/twitter-circle.svg'
import youtube from '@/images/youtube-circle.svg'
import HomePageHero from './HomePageHero.client'

export default async function HomePage() {
  return (
    <div className="flex flex-col grow gap-2 md:gap-8 w-full justify-center items-center h-full">
      <h1 className="text-5xl md:text-7xl font-extrabold text-center">Kellen Busby</h1>
      <HomePageHero />
      <div className="flex flex-col gap-2">
        <h2 className="text-xs uppercase">Profiles</h2>
        <div className="flex gap-2">
          <ProfileContainer
            href="https://www.contra.com/kellenbusby/?utm_source=kellenbusby.com"
            tooltip="Contra | kellenbusby"
          >
            <img src={contra.src} alt="contra logo" width={48} height={48} />
          </ProfileContainer>
          <ProfileContainer href="https://github.com/busbyk" tooltip="GitHub | busbyk">
            <img src={github.src} alt="github logo" width={48} height={48} />
          </ProfileContainer>
          <ProfileContainer
            href="https://www.instagram.com/kellenbusby"
            tooltip="Instagram | kellenbusby"
          >
            <img src={instagram.src} alt="instagram logo" width={48} height={48} />
          </ProfileContainer>
          <ProfileContainer
            href="https://www.linkedin.com/services/page/940755311278b0742a/"
            tooltip="LinkedIn | Kellen Busby Software"
          >
            <img src={linkedin.src} alt="linkedin logo" width={48} height={48} />
          </ProfileContainer>
          <ProfileContainer
            href="https://twitter.com/kellenbusbydev"
            tooltip="Twitter | @kellenbusbydev"
          >
            <img src={twitter.src} alt="twitter logo" width={48} height={48} />
          </ProfileContainer>
          <ProfileContainer
            href="https://www.youtube.com/channel/UCq4RGdMw9cCuFUsVXoXMkTQ"
            tooltip="YouTube | @kellenbusby"
          >
            <img src={youtube.src} alt="youtube logo" width={48} height={48} />
          </ProfileContainer>
        </div>
      </div>
    </div>
  )
}
