import { MenuVisibleLayout } from '@/widgets/layouts/MenuVisibleLayout'

import type { ReactNode } from 'react'

type MainLayoutProps = {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return <MenuVisibleLayout>{children}</MenuVisibleLayout>
}
