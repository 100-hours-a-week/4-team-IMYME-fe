import { GlobalLayoutClient } from './client/GlobalLayoutClient'

import type { ReactNode } from 'react'

type GlobalLayoutProps = {
  children: ReactNode
}

export function GlobalLayout({ children }: GlobalLayoutProps) {
  return <GlobalLayoutClient>{children}</GlobalLayoutClient>
}
