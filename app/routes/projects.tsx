import myfirstinstapost from '../images/myfirstinstapost.png'
import backcountrychecklist from '../images/backcountrychecklist.png'
import avyobs from '../images/avyobs.png'
import { MetaFunction } from '@remix-run/node'
import PageLayout from '~/components/layout/PageLayout'

export const meta: MetaFunction = () => {
  return [{ title: "Kellen Busby's Indie Projects" }]
}

export default function Projects() {
  return (
    <PageLayout heading="Indie Projects">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="">These are my independent projects.</p>
          <p className="">
            For client projects, check out my{' '}
            <a
              href="https://www.contra.com/kellenbusby/?utm_source=kellenbusby.com"
              className="ml-1 hover:underline"
            >
              Contra portfolio
            </a>
            .
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <a
          href="https://www.avyobs.com/?utm_source=kellenbusby.com"
          className="slide-in-background-from-left relative overflow-hidden flex flex-1 flex-col flex-grow gap-1 justify-center rounded-md p-4 max-w-max"
        >
          <h2 className="text-xl font-bold">AvyObs</h2>
          <div className="flex flex-col">
            <p className="max-w-[400px]">
              A snow and avalanche observations notification service. Always
              know what's going on in the mountains.
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
          className="slide-in-background-from-left relative overflow-hidden flex flex-1 flex-col flex-grow gap-1 justify-center rounded-md p-4 max-w-max"
        >
          <h2 className="text-xl font-bold">BackcountryChecklist</h2>
          <div className="flex flex-col">
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
      <div className="flex flex-col gap-6">
        <a
          href="https://www.myfirstinstapost.com/?utm_source=kellenbusby.com"
          className="slide-in-background-from-right relative overflow-hidden flex flex-1 flex-col flex-grow gap-1 justify-center rounded-md p-4 max-w-max"
        >
          <h2 className="text-xl font-bold">MyFirstInstaPost</h2>
          <div className="flex flex-col">
            <p>A silly website that shows you your first Instagram post.</p>
            <p>It's a fun stroll down memory lane.</p>
          </div>
          <img
            src={myfirstinstapost}
            alt="myfirstinstapost screenshot"
            className="w-[250px] sm:w-[300px] md:w-[400px] rounded-md shadow-lg"
            width={400}
          />
          <p className="text-sm">https://www.myfirstinstapost.com</p>
        </a>
      </div>
    </PageLayout>
  )
}
