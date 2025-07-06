import React from 'react'
import localFont from 'next/font/local'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import config from '@/payload.config'

import './style.css'
import MainLayout from '@/components/layout/MainLayout'
import ThemeProvider from '@/components/ThemeProvider'
import Link from 'next/link'

export const metadata = {
  title: 'Kellen Busby',
  description:
    'Full stack software engineer specializing in web app development for startups, small businesses, and unique projects.',
}

const rubik = localFont({
  src: './fonts/Rubik-VariableFont_wght.ttf',
})

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <html lang="en" className={rubik.className} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  
                  if (theme === 'dark' || (!theme && systemPrefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="flex min-h-screen w-screen flex-col overflow-x-clip bg-background text-foreground">
        <ThemeProvider>
          <MainLayout>{children}</MainLayout>
          {user && (
            <div className="absolute bottom-4 left-4">
              <Link href="/admin">
                <div className="flex justify-center items-center rounded-full bg-popover text-popover-foreground py-2.5 px-4">
                  Dash ↗️
                </div>
              </Link>
            </div>
          )}
        </ThemeProvider>
      </body>
    </html>
  )
}
