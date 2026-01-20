import { MenuVisibleLayout } from '@/widgets/layouts/MenuVisibleLayout'
import type { ReactNode } from 'react'

type MyPageLayoutProps = {
  children: ReactNode
}

export default function MyPageLayout({ children }: MyPageLayoutProps) {
  return <MenuVisibleLayout>{children}</MenuVisibleLayout>
}
