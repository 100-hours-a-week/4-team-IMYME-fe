import { ReactNode } from 'react'

import { ModeLayout } from '@/widgets/header'

type PvPLayoutProps = {
  children: ReactNode
}

export default function PvPLayout({ children }: PvPLayoutProps) {
  return <ModeLayout>{children}</ModeLayout>
}
