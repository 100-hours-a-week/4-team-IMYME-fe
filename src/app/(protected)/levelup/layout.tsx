import { ReactNode } from 'react'

import { LevelUpLayout as LevelUpLayoutWrapper } from '@/widgets/header'

type LevelUpLayoutProps = {
  children: ReactNode
}

export default function LevelUpLayout({ children }: LevelUpLayoutProps) {
  return <LevelUpLayoutWrapper>{children}</LevelUpLayoutWrapper>
}
