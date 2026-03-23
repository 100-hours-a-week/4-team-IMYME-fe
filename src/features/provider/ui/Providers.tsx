'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

import { FirebaseMessagingBootstrap } from './FirebaseMessagingBootstrap'

export function Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const shouldRenderDevtools = process.env.NODE_ENV === 'development'

  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseMessagingBootstrap />
      {shouldRenderDevtools ? <ReactQueryDevtools /> : null}
      {children}
    </QueryClientProvider>
  )
}
