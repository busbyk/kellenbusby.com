import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import github from '~/images/github-circle.svg'
import instagram from '~/images/instagram-circle.svg'
import twitter from '~/images/twitter-circle.svg'
import { ProfileContainer } from '~/components/ProfileContainer'

export default function Component() {
  return (
    <div className="pt-8 flex flex-col items-center">
      <div className="max-w-6xl flex flex-col gap-6">
        <h1 className="text-xl md:text-4xl font-bold">Blog: Coming Soon</h1>
        <p>Hit me up on social if you want to suggest what I write about.</p>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
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
              <img
                src={instagram}
                alt="instagram logo"
                width={48}
                height={48}
              />
            </ProfileContainer>
            <ProfileContainer
              href="https://twitter.com/kellenbusbydev"
              tooltip="Twitter | @kellenbusbydev"
            >
              <img src={twitter} alt="twitter logo" width={48} height={48} />
            </ProfileContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
