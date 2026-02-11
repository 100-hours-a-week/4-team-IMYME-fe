import { Header } from './client/Header'

import type { ReactNode } from 'react'

type LevelUpLayoutProps = {
  children: ReactNode
}

export function LevelUpLayout({ children }: LevelUpLayoutProps) {
  return (
    <>
      <Header showMenu={false} />
      {children}
    </>
  )
}
