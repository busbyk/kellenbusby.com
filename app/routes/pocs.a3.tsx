import { initialize } from '@open-iframe-resizer/core'
import { useEffect } from 'react'

export default function A3() {
  useEffect(() => {
    initialize({}, '#avy-web-providers-embed')
  }, [])

  useEffect(() => {
    initialize({}, '#avy-web-courses-embed')
  }, [])

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl">A3 Providers</h1>
        <iframe
          id="avy-web-providers-embed"
          src="https://a3-embeds-enhancements.preview.avy-fx.org/embeds/providers?backgroundColor=%23344A53&textColor=white"
          width="100%"
          style={{
            minHeight: 200,
          }}
        />
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl">A3 Courses</h1>
        <iframe
          id="avy-web-courses-embed"
          src="https://a3-embeds-enhancements.preview.avy-fx.org/embeds/courses?showFilters=true&backgroundColor=white"
          width="100%"
          style={{
            minHeight: 200,
            backgroundColor: 'white',
            padding: 20,
          }}
        />
      </div>
    </div>
  )
}
