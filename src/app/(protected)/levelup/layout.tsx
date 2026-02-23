import { ReactNode } from 'react'

import { ModeLayout } from '@/widgets/header'

type LevelUpLayoutProps = {
  children: ReactNode
}

export default function LevelUpLayout({ children }: LevelUpLayoutProps) {
  return <ModeLayout>{children}</ModeLayout>
}
