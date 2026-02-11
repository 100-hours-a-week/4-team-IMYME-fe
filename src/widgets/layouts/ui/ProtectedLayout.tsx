import { AuthBootstrap } from '@/features/provider'

import type { ReactNode } from 'react'

type ProtectedLayoutProps = {
  children: ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <>
      <AuthBootstrap />
      {children}
    </>
  )
}
