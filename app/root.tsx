import type { LinksFunction } from '@remix-run/node'
import {
  json,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import favicons from '~/data/favicons'
import '~/tailwind.css'
import 'mapbox-gl/dist/mapbox-gl.css'

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
        <Meta />
        <Links />
      </head>
      <body className="flex min-h-screen w-screen flex-col overflow-x-clip bg-theme-gray-default text-theme-white">
        <header className="w-full flex justify-between items-center px-4 pt-2">
          <Link to="/" className="font-extrabold">
            KB
          </Link>
          <div className="flex flex-col text-xs">
            <Link to="/cards" className="hover:underline">
              Cards
            </Link>
            <Link to="/projects" className="hover:underline">
              Projects
            </Link>
          </div>
        </header>
        <Outlet />
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(loaderData.ENV)}`,
          }}
        />
        <script
          type="text/javascript"
          src="http://classic.avantlink.com/affiliate_app_confirm.php?mode=js&authResponse=c1e670aa50272d0fb69a8a3941c938cb36b9fd3a"
        ></script>
        {process.env.NODE_ENV === 'production' && (
          <script
            defer
            src="/stats/js/script.js"
            data-api="/stats/api/event"
            data-domain="kellenbusby.com"
          ></script>
        )}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
