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
        <div className="app-frame">{children}</div>
      </body>
    </html>
  )
}
