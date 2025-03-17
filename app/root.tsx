import type { LinksFunction } from '@remix-run/node'
import {
  isRouteErrorResponse,
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useRouteError,
  useRouteLoaderData,
} from '@remix-run/react'
import favicons from '~/data/favicons'
import '~/styles/tailwind.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import MainLayout from './components/layout/MainLayout'

export const links: LinksFunction = () => [...favicons]

export function loader() {
  return json({
    ENV: {
      NODE_ENV: process.env.NODE_ENV,
      MAPBOX_TOKEN: process.env.MAPBOX_TOKEN,
    },
  })
}

export function Layout({ children }: { children: React.ReactNode }) {
  const loaderData = useRouteLoaderData<typeof loader>('root')

  let renderMainLayout = true

  const location = useLocation()
  const pathname = location.pathname

  if (pathname.includes('/keystatic')) {
    renderMainLayout = false
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta property="og:url" content="https://www.kellenbusby.com" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Kellen Busby" />
        <meta
          property="og:description"
          content="Full stack software engineer specializing in web app development for startups, small businesses, and unique projects."
        />
        <meta
          property="og:image"
          content="https://www.kellenbusby.com/kellenbusby-opengraph.png"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="kellenbusby.com" />
        <meta property="twitter:url" content="https://www.kellenbusby.com" />
        <meta name="twitter:title" content="Kellen Busby" />
        <meta
          name="twitter:description"
          content="Full stack software engineer specializing in web app development for startups, small businesses, and unique projects."
        />
        <meta
          name="twitter:image"
          content="https://www.kellenbusby.com/kellenbusby-opengraph.png"
        />
        <Meta />
        <Links />
      </head>
      <body className="flex min-h-screen w-screen flex-col overflow-x-clip bg-theme-gray-default text-theme-white">
        {renderMainLayout ? <MainLayout>{children}</MainLayout> : children}
        <ScrollRestoration />
        {loaderData && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.ENV = ${JSON.stringify(loaderData.ENV)}`,
            }}
          />
        )}
        {process.env.NODE_ENV === 'production' && (
          <script
            defer
            src="/stats/js/script.js"
            data-api="/stats/api/event"
            data-domain="kellenbusby.com"
          ></script>
        )}
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex justify-center items-center flex-col gap-6 flex-grow">
        <h1 className="text-4xl">
          {error.status} <span className="text-xl">{error.statusText}</span>
        </h1>
        <p>{error.data}</p>
      </div>
    )
  } else if (error instanceof Error) {
    return (
      <div className="flex justify-center items-center flex-col gap-6 flex-grow">
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    )
  } else {
    return (
      <div className="flex justify-center items-center flex-col gap-6 flex-grow">
        <h1>Unknown Error</h1>
      </div>
    )
  }
}
