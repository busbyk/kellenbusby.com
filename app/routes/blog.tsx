import { useEffect } from 'react'

export default function Blog() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src =
      'https://cardonomics-fe-web-git-embed-widget-subscribeso.vercel.app/embed.js'
    script.async = true
    script.crossOrigin = 'anonymous'

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])
  return (
    <div className="flex flex-col gap-2 md:gap-8 flex-grow w-full items-center p-2 md:p-5">
      <div className="max-w-[800px]">
        <div
          className="cardo-widget"
          data-cardo-widget-type="blog"
          data-cardo-slug="capital-one-quicksilver"
          data-cardo-influencer="kellenbusby"
        ></div>
      </div>
    </div>
  )
}
