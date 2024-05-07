import { useEffect } from 'react'

export default function Blog() {
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
    <div className="flex flex-col gap-6 md:gap-8 flex-grow w-full items-center px-2 pb-2 md:px-5 md:pb-5 pt-8 md:pt-14">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-center">
          My Recommended <br />
          Credit Cards
        </h1>
        <a
          href="https://www.cardonomics.com/i/kellenbusby"
          target="_blank"
          rel="noopener noreferrer"
          className="text-center max-w-max mx-auto"
        >
          <button className="border rounded-md px-4 py-0.5 text-sm hover:shadow-xl">
            My Top Picks on Cardonomics
          </button>
        </a>
        <div className="flex flex-col gap-2 max-w-[90%] md:max-w-[600px] mx-auto">
          <p className="text-center">
            I use a few different cards to maximize either cash back or points
            depending on the card.
          </p>
          <p className="text-center">
            Run all of your transactions through the right card and make sure
            you pay off your card in full every statement period and you'll get
            free flights, hotel stays, and make significant cash back.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3 items-center">
        <h2 className="font-bold text-lg border-b px-4 py-1">
          All-arounder, optimizing for points
        </h2>
        <div
          className="cardo-widget"
          data-cardo-widget-type="card"
          data-cardo-slug="kellenbusby__capital-one-venture-one-rewards-credit-card"
        ></div>
      </div>
      <div className="flex flex-col gap-3 items-center">
        <h2 className="font-bold text-lg border-b px-4 py-1">
          Great shared expenses card for cash back
        </h2>
        <div
          className="cardo-widget"
          data-cardo-widget-type="card"
          data-cardo-slug="kellenbusby__capital-one-savor-one-cash-rewards-credit-card"
        ></div>
      </div>
      <div className="flex flex-col gap-3 items-center">
        <h2 className="font-bold text-lg border-b px-4 py-1">
          Better all-arounder, book flights through Chase Travel℠
        </h2>
        <div
          className="cardo-widget"
          data-cardo-widget-type="card"
          data-cardo-slug="kellenbusby__chase-freedom-unlimited"
        ></div>
      </div>
    </div>
  )
}
