import localFont from 'next/font/local'
import React from 'react'

import MainLayout from '@/components/layout/MainLayout'
import ThemeProvider from '@/components/ThemeProvider'
import './style.css'

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
      </body>
    </html>
  )
}
