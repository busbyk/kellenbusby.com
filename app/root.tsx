import type { LinksFunction } from '@remix-run/node'
import {
  json,
  Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import favicons from '~/data/favicons'
import '~/tailwind.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import classNames from 'classnames'

export const links: LinksFunction = () => [...favicons]

export function loader() {
  return json({
    ENV: {
      NODE_ENV: process.env.NODE_ENV,
      MAPBOX_TOKEN: process.env.MAPBOX_TOKEN,
    },
  })
}

export default function App() {
  const loaderData = useLoaderData<typeof loader>()

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
        <header className="w-full flex justify-between items-center px-4 py-2">
          <div className="flex gap-8 items-center">
            <Link to="/" className="font-extrabold">
              KB
            </Link>
            <div className="flex items-center gap-4">
              <NavLink
                to="/life"
                className={({ isActive }) =>
                  classNames(
                    'border-b-2',
                    isActive && 'border-b-theme-white',
                    !isActive && 'border-b-transparent'
                  )
                }
              >
                Life
              </NavLink>
              <NavLink
                to="/software"
                className={({ isActive }) =>
                  classNames(
                    'border-b-2',
                    isActive && 'border-b-theme-white',
                    !isActive && 'border-b-transparent'
                  )
                }
              >
                Software
              </NavLink>
            </div>
          </div>
          <div className="flex flex-col text-xs">
            <Link to="/blog" className="hover:underline">
              Blog
            </Link>
            <Link to="/projects" className="hover:underline">
              Projects
            </Link>
          </div>
        </header>
        <main className="w-full px-4 pb-2 md:px-5 md:pb-5 overflow-x-clip min-h-[calc(100vh-64px)] flex flex-col">
          <Outlet />
        </main>
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(loaderData.ENV)}`,
          }}
        />
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
