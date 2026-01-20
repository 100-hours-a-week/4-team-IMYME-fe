import { ReactNode } from 'react'

import { Header } from '@/widgets/header'

type LevelUpLayoutProps = {
  children: ReactNode
}

export default function LevelUpLayout({ children }: LevelUpLayoutProps) {
  return (
    <div>
      <Header showMenu={false} />
      {children}
    </div>
  )
}
