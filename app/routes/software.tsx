import { Link, MetaFunction } from '@remix-run/react'
import ProjectPostCard from '~/components/ProjectPostCard'
import backcountrychecklist from '../images/backcountrychecklist.png'
import avyobs from '../images/avyobs.png'
import TechBadge from '~/components/TechBadge'
import remixIcon from '../images/remix-letter-glowing.png'
import reactIcon from '../images/react-js-logo.webp'
import nodeIcon from '../images/node-js-logo.webp'
import typescriptIcon from '../images/typescript-logo.png'
import tailwindIcon from '../images/tailwindcss-logo.png'
import strapiIcon from '../images/strapi-logo.png'
import nextjsIcon from '../images/nextjs-logo.png'
import pythonIcon from '../images/python-logo.webp'
import awsIcon from '../images/aws-logo.webp'
import postgresIcon from '../images/postgres-logo.png'
import supabaseIcon from '../images/supabase-logo.png'
import mongodbIcon from '../images/mongodb-logo.svg'
import expressIcon from '../images/express-logo.webp'
import awsGlueIcon from '../images/aws-glue-logo.webp'
import openaiIcon from '../images/openai-logo.webp'
import stripeIcon from '../images/stripe-logo.svg'
import resendIcon from '../images/resend-logo.png'
import twilioIcon from '../images/twilio-logo.png'
import Service from '~/components/Service'
import { ProfileContainer } from '~/components/ProfileContainer'
import contra from '../images/contra-circle.svg'
import github from '../images/github-circle.svg'
import linkedin from '../images/linkedin-circle.svg'
import PageLayout from '~/components/layout/PageLayout'

export const meta: MetaFunction = () => {
  return [
    { title: 'Kellen Busby Software' },
    {
      name: 'description',
      content: 'Freelance full stack web app developer',
    },
  ]
}

const emailParts = {
  user: 'kellenbusby',
  domain: 'gmail',
  tld: 'com',
}
const constructEmail = () => {
  return `${emailParts.user}@${emailParts.domain}.${emailParts.tld}`
}

export default function Software() {
  const handleContactClick = () => {
    const email = constructEmail()
    window.open(`mailto:${email}`, '_blank')
  }

  return (
    <PageLayout
      heading={
        <>
          Freelance Full Stack
          <br />
          Web App Developer
        </>
      }
    >
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <figure className="flex w-full">
            <img
              src="/blog/software-cover-photo.webp"
              width={1400}
              height={357}
              className="w-full rounded-xl shadow-xl aspect-[1400/357]"
            />
          </figure>
          <div className="flex gap-2 items-center">
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
              href="https://www.linkedin.com/services/page/940755311278b0742a/"
              tooltip="LinkedIn | Kellen Busby Software"
            >
              <img src={linkedin} alt="linkedin logo" width={48} height={48} />
            </ProfileContainer>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl md:text-4xl font-semibold border-l-8 border-l-theme-orange-default pl-2">
            About Me
          </h2>
          <div className="flex flex-col gap-4 leading-7">
            <p>
              I'm a freelance full stack web app developer. I've worked on other
              types software and different aspects of the development lifecycle
              (mobile apps, APIs, CI/CD pipelines) over the last ten years of
              professional software development. But I primarily develop web
              applications for small organizations, startups, and individuals
              using modern tech.
            </p>
            <p>
              Software development is more than designing and implementing a
              software system that accomplishes the desired goal. It starts at
              the idea. Why are we building this? How do we build it in a way
              that efficiently and effectively accomplishes that goal? I so
              enjoy looking at the big picture and then diving down into the
              details. This full process is what makes me enjoy software
              development.{' '}
            </p>
            <p>
              My life and my work are intermingled. I'm a skier, climber,
              mountain biker, traveler, and hobbyist. Those things are a huge
              part of who I am and they've shaped how I approach problems and
              live my{' '}
              <Link to="/life" className="underline hover:no-underline">
                life
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl md:text-4xl font-semibold border-l-8 border-l-theme-orange-default pl-2">
            Tech
          </h2>
          <div className="flex flex-col gap-10">
            <div className="flex py-4 flex-wrap gap-2">
              <TechBadge
                icon={
                  <img
                    src={remixIcon}
                    className="h-full w-full rounded-full overflow-hidden object-cover"
                  />
                }
                href="https://www.remix.run"
              >
                Remix.run
              </TechBadge>
              <TechBadge
                icon={
                  <img
                    src={reactIcon}
                    className="h-full w-full rounded-full overflow-hidden object-cover"
                  />
                }
                href="https://react.dev"
              >
                React
              </TechBadge>
              <TechBadge
                icon={
                  <img
                    src={nodeIcon}
                    className="h-full w-full rounded-full overflow-hidden object-cover"
                  />
                }
                href="https://nodejs.org"
              >
                Node.js
              </TechBadge>
              <TechBadge
                icon={
                  <img
                    src={typescriptIcon}
                    className="h-full w-full rounded-full overflow-hidden object-cover"
                  />
                }
                href="https://www.typescriptlang.org"
              >
                Typescript
              </TechBadge>
              <TechBadge
                icon={
                  <img
                    src={tailwindIcon}
                    className="h-full w-full rounded-full overflow-hidden object-cover"
                  />
                }
                href="https://tailwindcss.com"
              >
                TailwindCSS
              </TechBadge>
              <TechBadge
                icon={
                  <img
                    src={strapiIcon}
                    className="h-full w-full rounded-full overflow-hidden object-cover"
                  />
                }
                href="https://strapi.io"
              >
                Strapi CMS
              </TechBadge>
              <TechBadge
                icon={
                  <img
                    src={nextjsIcon}
                    className="h-full w-full rounded-full overflow-hidden object-cover"
                  />
                }
                href="https://nextjs.org"
              >
                Next.js
              </TechBadge>
              <TechBadge
                icon={
                  <img
                    src={pythonIcon}
                    className="h-full w-full rounded-full overflow-hidden object-cover"
                  />
                }
                href="https://www.python.org"
              >
                Python
              </TechBadge>
              <TechBadge
                icon={
                  <img
                    src={awsIcon}
                    className="h-full w-full rounded-full overflow-hidden object-cover"
                  />
                }
                href="https://aws.amazon.com"
              >
                AWS
              </TechBadge>
              <TechBadge
                icon={
                  <img
                    src={postgresIcon}
                    className="h-full w-full rounded-full overflow-hidden object-cover"
                  />
                }
                href="https://www.postgresql.org"
              >
                Postgres
              </TechBadge>
              <TechBadge
                icon={
                  <img
                    src={supabaseIcon}
                    className="h-full w-full rounded-full overflow-hidden object-cover"
                  />
                }
                href="https://supabase.com"
              >
                Supabase
              </TechBadge>
              <TechBadge
                icon={
                  <img
                    src={mongodbIcon}
                    className="h-full w-full rounded-full overflow-hidden object-cover"
                  />
                }
                href="https://www.mongodb.com"
              >
                MongoDB
              </TechBadge>
              <TechBadge
                icon={
                  <img
                    src={expressIcon}
                    className="h-full w-full rounded-full overflow-hidden object-cover"
                  />
                }
                href="https://expressjs.com"
              >
                Express.js
              </TechBadge>
              <TechBadge
                icon={
                  <img
                    src={awsGlueIcon}
                    className="h-full w-full rounded-full overflow-hidden object-cover"
                  />
                }
                href="https://aws.amazon.com/glue"
              >
                AWS Glue
              </TechBadge>
              <TechBadge
                icon={
                  <img
                    src={openaiIcon}
                    className="h-full w-full rounded-full overflow-hidden object-cover"
                  />
                }
                href="https://www.openai.com"
              >
                OpenAI
              </TechBadge>
              <TechBadge
                icon={
                  <img
                    src={stripeIcon}
                    className="h-full w-full rounded-full overflow-hidden object-cover"
                  />
                }
                href="https://stripe.com"
              >
                Stripe
              </TechBadge>
              <TechBadge
                icon={
                  <img
                    src={resendIcon}
                    className="h-full w-full rounded-full overflow-hidden object-cover"
                  />
                }
                href="https://resend.com"
              >
                Resend
              </TechBadge>
              <TechBadge
                icon={
                  <img
                    src={twilioIcon}
                    className="h-full w-full rounded-full overflow-hidden object-cover"
                  />
                }
                href="https://twilio.com"
              >
                Twilio
              </TechBadge>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl md:text-4xl font-semibold border-l-8 border-l-theme-orange-default pl-2">
            Services
          </h2>
          <div className="grid sm:grid-cols-2 gap-10 leading-6 py-4">
            <Service
              title="SaaS Startup Developer"
              description="I'll architect and implement your SaaS startup idea from idea to growth."
              className="border-t-0 sm:border-t"
            />
            <Service
              title="Senior Engineer Advisory Role"
              description="Need a senior developer to advise on your team's development practices and technical decisions? I'll advise you and your team to make sure you can execute on your ideas and not rack up a mountain of tech debt on the way."
            />
            <Service
              title="Web Application Feature Development"
              description="Need a new feature for your existing full stack web application? I can jump into an existing codebase and get started quickly to implement your new feature."
            />
            <Service
              title="Web Application Discovery"
              description="Did you have a dev shop build your web app or SaaS startup platform but you've since moved on? You might not know exactly what you have. I can dive in and document your tech, your environments, write a developer getting started guide, and give you a list of recommendations for essential improvements."
            />
            <Service
              title="Technical Architecture Design"
              description="Have an idea but can't decide on tech stack? I'll break down your idea into work chunks and designs your app's architecture so you can get started knowing you'll be able to support all the features you need in the future."
            />
            <Service
              title="POC Project"
              description="Have an idea and want to prove it works? I'll hack together a POC version in a short period of time to make sure it's viable."
            />
          </div>
          <div className="flex justify-center items-center py-4">
            <button
              className="group bg-black flex items-center gap-1.5 px-10 py-4 rounded-md text-lg hover:shadow-md"
              onClick={handleContactClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5 group-hover:text-theme-purple-light"
              >
                <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM20 7.23792L12.0718 14.338L4 7.21594V19H20V7.23792ZM4.51146 5L12.0619 11.662L19.501 5H4.51146Z"></path>
              </svg>
              Get in Touch
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl md:text-4xl font-semibold border-l-8 border-l-theme-orange-default pl-2">
            Professional Experience
          </h2>
          <div className="flex flex-col gap-10">
            <div>
              <h3 className="text-xl font-semibold mb-1">
                Owner - Kellen Busby Software LLC
              </h3>
              <p className="text-theme-white/70 mb-2">08/2018 - Present</p>
              <div className="flex flex-col gap-4 pl-4">
                <div>
                  <h4 className="font-medium mb-2">
                    Freelancing Projects
                    <span className="text-theme-white/70 text-sm ml-2">
                      2020 - Present
                    </span>
                  </h4>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-2 gap-y-4">
                      <ProjectPostCard
                        title="Cardonomics"
                        tagline="Credit card affiliate marketing platform for creators built using Remix & Strapi for startup"
                        className="h-full"
                        to="/blog/cardonomics"
                      />
                      <ProjectPostCard
                        title="Data Platform"
                        tagline="Audience data access and reporting tool built using the MERN stack & AWS Glue for data company users"
                        className="h-full"
                        to="/blog/data-platform"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 gap-y-4">
                      <ProjectPostCard
                        title="Random Trivia Generator"
                        tagline="Rebuild of existing application frontend and backend including a database migration and new features for entrepreneur"
                        className="h-full"
                        to="/blog/random-trivia-generator"
                      />
                      <ProjectPostCard
                        title="Static websites with CMS"
                        tagline="Several static websites with content management systems for small businesses"
                        className="h-full"
                        to="/blog/static-sites-with-cms"
                      />
                    </div>
                    <div className="flex justify-center">
                      <ProjectPostCard
                        title="More Projects"
                        tagline="View more projects on my Contra profile"
                        href="https://www.contra.com/kellenbusby/?utm_source=kellenbusby.com"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">
                    Riverstone Resources LLC{' '}
                    <span className="text-theme-white/70 text-sm ml-2">
                      2019
                    </span>
                  </h4>
                  <p className="mb-2"></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      Established and implemented CI/CD practices using Azure
                      DevOps, successfully productionizing four in-flight
                      applications
                    </li>
                    <li>
                      Developed and deployed a React frontend for an NLP-based
                      industry news aggregation system, enabling users to
                      filter, search articles, generate reports, and manage
                      article attributes
                    </li>
                    <li>
                      Maintained and enhanced Python backend for NLP-based news
                      aggregation, independently delivering bug fixes and
                      improvements
                    </li>
                    <li>
                      Created custom RShiny theme incorporating company branding
                    </li>
                    <li>
                      Mastered Pandas fundamentals and delivered management data
                      visualizations within two weeks
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">
                    Bookcicle LLC{' '}
                    <span className="text-theme-white/70 text-sm ml-2">
                      2018
                    </span>
                  </h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      Led test-driven development of Python Lambda functions for
                      customized manuscript export using python-docx
                    </li>
                    <li>
                      Implemented React frontend changes supporting manuscript
                      export functionality
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-1">
                Software Developer - Liberty Mutual Insurance
              </h3>
              <p className="text-theme-white/70 mb-2">
                08/2016 - 08/2018 | Portsmouth, NH
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Architected and developed an enterprise-level chatbot using
                  NodeJS, Amazon Lex, AWS Lambda, API Gateway, DynamoDB, and
                  ElasticSearch
                </li>
                <li>
                  Self-taught AWS DevOps skills to support infrastructure needs
                </li>
                <li>
                  Conducted comprehensive research on chatbot technologies
                  including Amazon Lex, DialogFlow, Luis.ai, wit.ai, and
                  Microsoft Bot Framework
                </li>
                <li>
                  Designed and implemented a dashboard web application for
                  underwriters to consolidate and visualize data from multiple
                  sources
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-1">
                IT Analyst, Technical Development Program - Liberty Mutual
                Insurance
              </h3>
              <p className="text-theme-white/70 mb-2">
                06/2014 - 08/2016 | Seattle, WA / Dover, NH
              </p>
              <p className="mb-4">
                The Technical Development Program is an IT rotational program
                that exposes participants to different areas of the company, all
                aspects of the software development lifecycle, and provides
                technical training. This program was influential in my path to
                software development.
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Developed business cases for new project proposals</li>
                <li>
                  Built a hybrid mobile application for new claims submissions
                </li>
                <li>Lead the front-end development of two Angular web apps</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl md:text-4xl font-semibold border-l-8 border-l-theme-orange-default pl-2">
            Active Indie Projects
          </h2>
          <p className="">These are my independent projects.</p>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <a
                href="https://www.avyobs.com/?utm_source=kellenbusby.com"
                className="slide-in-background-from-left relative overflow-hidden flex flex-1 flex-col flex-grow gap-1 justify-center items-center rounded-md p-4"
              >
                <h2 className="text-xl font-bold">AvyObs</h2>
                <div className="flex flex-col items-center text-center">
                  <p className="max-w-[400px]">
                    A snow and avalanche observations notification service.
                    Always know what's going on in the mountains.
                  </p>
                </div>
                <img
                  src={avyobs}
                  alt="backcountry checklist screenshot"
                  className="w-[250px] sm:w-[300px] md:w-[400px] rounded-md shadow-lg"
                  width={1000}
                />
                <p className="text-sm">https://www.avyobs.com</p>
              </a>
            </div>
            <div className="flex flex-col gap-6">
              <a
                href="https://www.backcountrychecklist.com/?utm_source=kellenbusby.com"
                className="slide-in-background-from-left relative overflow-hidden flex flex-1 flex-col flex-grow gap-1 justify-center items-center rounded-md p-4"
              >
                <h2 className="text-xl font-bold">BackcountryChecklist</h2>
                <div className="flex flex-col items-center text-center">
                  <p className="max-w-[400px]">
                    A lighthearted checklist for a fun and safe day of skiing,
                    snowboarding, or snowmobiling in the backcountry.
                  </p>
                </div>
                <img
                  src={backcountrychecklist}
                  alt="backcountry checklist screenshot"
                  className="w-[150px] sm:w-[200px] md:w-[250px] rounded-md shadow-lg"
                  width={150}
                />
                <p className="text-sm">https://www.backcountrychecklist.com</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
