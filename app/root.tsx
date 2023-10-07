import type { LinksFunction } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import styles from './tailwind.css'
import favicons from './data/favicons'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  ...favicons,
]

export function loader() {
  return {
    ENV: {
      NODE_ENV: process.env.NODE_ENV,
    },
  }
}

export default function App() {
  const loaderData = useLoaderData()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex min-h-screen w-screen flex-col overflow-x-hidden bg-theme-gray-default text-theme-white">
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
