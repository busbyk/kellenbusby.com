import localFont from 'next/font/local'
import React from 'react'

import MainLayout from '@/components/layout/MainLayout'
import ThemeProvider from '@/components/ThemeProvider'
import './style.css'

export const metadata = {
  title: 'Kellen Busby',
  description:
    'Full stack software engineer specializing in web app development for startups, small businesses, and unique projects.',
  openGraph: {
    title: 'Kellen Busby',
    description:
      'Full stack software engineer specializing in web app development for startups, small businesses, and unique projects.',
    url: 'https://www.kellenbusby.com',
    type: 'website',
    images: [
      {
        url: 'https://www.kellenbusby.com/kellenbusby-opengraph.png',
        width: 1200,
        height: 630,
        alt: 'Kellen Busby',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kellen Busby',
    description:
      'Full stack software engineer specializing in web app development for startups, small businesses, and unique projects.',
    images: ['https://www.kellenbusby.com/kellenbusby-opengraph.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-128x128.png', sizes: '128x128', type: 'image/png' },
      { url: '/favicon-196x196.png', sizes: '196x196', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon-57x57.png', sizes: '57x57' },
      { url: '/apple-touch-icon-60x60.png', sizes: '60x60' },
      { url: '/apple-touch-icon-72x72.png', sizes: '72x72' },
      { url: '/apple-touch-icon-76x76.png', sizes: '76x76' },
      { url: '/apple-touch-icon-114x114.png', sizes: '114x114' },
      { url: '/apple-touch-icon-120x120.png', sizes: '120x120' },
      { url: '/apple-touch-icon-144x144.png', sizes: '144x144' },
      { url: '/apple-touch-icon-152x152.png', sizes: '152x152' },
      { url: '/apple-touch-icon-167x167.png', sizes: '167x167' },
      { url: '/apple-touch-icon-180x180.png', sizes: '180x180' },
    ],
  },
}

const rubik = localFont({
  src: './fonts/Rubik-VariableFont_wght.ttf',
})

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

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
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && (
          <script
            defer
            src="/stats/js/script.js"
            data-api="/stats/api/event"
            data-domain="kellenbusby.com"
          />
        )}
      </body>
    </html>
  )
}
