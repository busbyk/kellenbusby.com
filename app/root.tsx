import type { LinksFunction } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import styles from './tailwind.css'
import favicons from './data/favicons'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  ...favicons,
]

export default function App() {
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
        <Scripts />
        <script
          type="text/javascript"
          src="https://classic.avantlink.com/affiliate_app_confirm.php?mode=js&authResponse=c1e670aa50272d0fb69a8a3941c938cb36b9fd3a"
        ></script>
        <LiveReload />
      </body>
    </html>
  )
}
