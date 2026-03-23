'use client'

import { Header } from '@/widgets/header'

import type { ReactNode } from 'react'

type MenuVisibleLayoutProps = {
  children: ReactNode
}

export function MenuVisibleLayout({ children }: MenuVisibleLayoutProps) {
  return (
    <div className="flex h-full min-h-screen w-full flex-col">
      <Header goMain={true} />
      {children}
    </div>
  )
}
