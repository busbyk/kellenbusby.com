import { useEffect, useState } from 'preact/hooks';
import { useHover } from '../hooks/useHover';
import { ProfileContainer } from './ProfileContainer';
import CaretRightIcon from './CaretRightIcon';
import { cn } from '../lib/utils';

// Import images
import softwareHeadshot from '../assets/software-headshot.webp';
import outdoorsHeadshot from '../assets/outdoors-headshot.webp';
import ContraCircleIcon from './icons/ContraCircleIcon';
import GithubCircleIcon from './icons/GithubCircleIcon';
import LinkedinCircleIcon from './icons/LinkedinCircleIcon';
import InstagramCircleIcon from './icons/InstagramCircleIcon';
import TwitterCircleIcon from './icons/TwitterCircleIcon';
import YoutubeCircleIcon from './icons/YoutubeCircleIcon';

export default function HomeContent() {
  const [profile, setProfile] = useState<'software' | 'outdoors'>('software');

  const [softwareLinkRef, softwareHovered] = useHover<HTMLAnchorElement>();
  const [outdoorsLinkRef, outdoorsHovered] = useHover<HTMLAnchorElement>();

  useEffect(() => {
    if (softwareHovered) {
      setProfile('software');
    }
  }, [softwareHovered]);

  useEffect(() => {
    if (outdoorsHovered) {
      setProfile('outdoors');
    }
  }, [outdoorsHovered]);

  return (
    <div className="flex flex-col gap-2 md:gap-8 grow w-full justify-center items-center h-full">
      <h1 className="text-5xl md:text-7xl font-extrabold text-center">
        Kellen Busby
      </h1>
      <figure className="relative h-36 md:h-56 w-full -mb-4 overflow-hidden">
        <img
          src={softwareHeadshot.src}
          alt="Kellen Busby software engineer"
          width={192}
          height={192}
          className={cn(
            'absolute inset-0 mx-auto my-auto rounded-full w-32 md:w-48 shadow-lg motion-reduce:duration-[0s] transition duration-1000',
            profile === 'outdoors' && 'md:-rotate-90 md:opacity-0',
            profile === 'software' && 'md:rotate-0 md:opacity-100'
          )}
          style={{ transformOrigin: '50% 300px' }}
        />
        <img
          src={outdoorsHeadshot.src}
          alt="Kellen Busby outdoors person"
          width={192}
          height={192}
          className={cn(
            'hidden md:block absolute inset-0 mx-auto my-auto rounded-full w-32 md:w-48 shadow-lg motion-reduce:duration-[0s] transition duration-1000',
            profile === 'software' && 'rotate-90 opacity-0',
            profile === 'outdoors' && 'rotate-0 opacity-100'
          )}
          style={{ transformOrigin: '50% 300px' }}
        />
      </figure>
      <div className="flex flex-col md:min-w-[800px] md:flex-row md:items-center md:gap-8">
        <a
          href="/software"
          className="slide-in-background-from-right relative overflow-hidden flex flex-1 flex-col grow md:gap-1 justify-center items-center md:items-end rounded-md md:h-48 p-4"
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
          <button className="md:hidden mt-3 pl-4 pr-2 py-1.5 rounded-md border-2 border-foreground/20 flex items-center gap-1">
            Software <CaretRightIcon />
          </button>
        </a>
        <div className="bg-foreground/20 h-px w-42 md:h-44 md:w-1" />
        <a
          href="/life"
          className="slide-in-background-from-left relative overflow-hidden flex flex-1 flex-col grow md:gap-1 justify-center items-center md:items-start rounded-md md:h-60 p-4"
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
  );
}
