import { MetaFunction } from '@remix-run/node'
import { useEffect } from 'react'
import PageLayout from '~/components/layout/PageLayout'
import '~/styles/cardonomics-widget-overrides.css'

export const meta: MetaFunction = () => {
  return [{ title: "Kellen's Credit Card Recommendations" }]
}

export const links = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap',
  },
]

export default function Cards() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://www.cardonomics.com/embed.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    script.referrerPolicy = 'origin'

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])
  return (
    <PageLayout
      heading={
        <>
          My Recommended <br />
          Credit Cards
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <a
          href="https://www.cardonomics.com/i/kellenbusby?utm_source=kellenbusby.com"
          target="_blank"
          rel="noopener noreferrer"
          className=""
        >
          <button className="border rounded-md px-4 py-0.5 text-sm hover:shadow-xl">
            My Top Picks on Cardonomics
          </button>
        </a>
        <div className="flex flex-col gap-2">
          <p className="">
            I use a few different cards to maximize either cash back or points
            depending on the card.
          </p>
          <p className="">
            Run all of your transactions through the right card and make sure
            you pay off your card in full every statement period and you'll get
            free flights, hotel stays, and make significant cash back.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-lg border-b px-4 py-1">
          All-arounder, optimizing for points
        </h2>
        <div
          className="cardo-widget"
          data-cardo-widget-type="card"
          data-cardo-slug="kellenbusby__capital-one-venture-one-rewards-credit-card"
        ></div>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-lg border-b px-4 py-1">
          Great shared expenses card for cash back
        </h2>
        <div
          className="cardo-widget"
          data-cardo-widget-type="card"
          data-cardo-slug="kellenbusby__capital-one-savor-one-cash-rewards-credit-card"
        ></div>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-lg border-b px-4 py-1">
          Better all-arounder, book flights through Chase Travel℠
        </h2>
        <div
          className="cardo-widget"
          data-cardo-widget-type="card"
          data-cardo-slug="kellenbusby__chase-freedom-unlimited"
        ></div>
      </div>
    </PageLayout>
  )
}
