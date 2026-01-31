import { Provider } from '@/features/provider'
import { Toaster } from '@/shared/ui/sonner'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './globals.css'

export const metadata: Metadata = {
  title: 'MINE',
  description: "IMYME's Project",
}

type RootLayoutProps = {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body className="app-shell">
        <div className="app-frame">
          <Toaster position="top-center" />
          <Provider>{children}</Provider>
        </div>
      </body>
    </html>
  )
}
