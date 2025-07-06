import React from 'react'
import localFont from 'next/font/local'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import config from '@/payload.config'

import './style.css'
import MainLayout from '@/components/layout/MainLayout'
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
    <html lang="en" className={rubik.className}>
      <body className="flex min-h-screen w-screen flex-col overflow-x-clip bg-background text-foreground">
        <MainLayout>{children}</MainLayout>
        {user && (
          <div className="absolute top-4 right-4">
            <Link href="/admin">
              <div className="flex justify-center items-center rounded-full bg-popover text-popover-foreground py-2.5 px-4">
                Dash ↗️
              </div>
            </Link>
          </div>
        )}
      </body>
    </html>
  )
}
