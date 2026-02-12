import { Header } from './client/Header'

import type { ReactNode } from 'react'

type ModeLayoutProps = {
  children: ReactNode
}

export function ModeLayout({ children }: ModeLayoutProps) {
  return (
    <>
      <Header showMenu={false} />
      {children}
    </>
  )
}
