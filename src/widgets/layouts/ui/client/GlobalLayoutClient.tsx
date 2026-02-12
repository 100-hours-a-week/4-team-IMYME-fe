'use client'

import { Provider } from '@/features/provider'
import { GoogleAnalytics } from '@/shared'
import { WebVitalsTracker } from '@/shared/lib/WebVitalsTracker'
import { Toaster } from '@/shared/ui/sonner'

import type { ReactNode } from 'react'

type GlobalLayoutClientProps = {
  children: ReactNode
}

export function GlobalLayoutClient({ children }: GlobalLayoutClientProps) {
  const shouldRenderAnalytics = Boolean(process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS)

  return (
    <>
      <WebVitalsTracker />
      {shouldRenderAnalytics ? (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS as string} />
      ) : null}
      <div className="app-frame">
        <Toaster position="top-center" />
        <Provider>{children}</Provider>
      </div>
    </>
  )
}
