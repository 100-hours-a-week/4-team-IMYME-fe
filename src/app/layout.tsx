import { GlobalLayout } from '@/widgets/layouts'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './globals.css'

export const metadata: Metadata = {
  title: 'MINE',
  description: "IMYME's Project",
  icons: {
    icon: [{ url: '/logo.png', type: 'image/png' }],
  },
}

type RootLayoutProps = {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body className="app-shell">
        <GlobalLayout>{children}</GlobalLayout>
      </body>
    </html>
  )
}
