'use client'

import { HydrationBoundary } from '@tanstack/react-query'

import { ProfileDashboard } from '@/widgets/profile'

import { MenuVisibleLayout } from './MenuVisibleLayout'

import type { UserProfile } from '@/entities/user'
import type { DehydratedState } from '@tanstack/react-query'
import type { ReactNode } from 'react'

type ProfilePagesLayoutProps = {
  children: ReactNode
  initialProfile?: UserProfile | null
  dehydratedState?: DehydratedState
}

const CONTENT_CLASSNAME = 'flex w-full flex-1 flex-col'

export function ProfilePagesLayout({
  children,
  initialProfile,
  dehydratedState,
}: ProfilePagesLayoutProps) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <MenuVisibleLayout>
        <div className={CONTENT_CLASSNAME}>
          {/* main/mypage 공통 프로필 영역은 서버가 먼저 준 초기 프로필을 즉시 사용한다. */}
          <ProfileDashboard initialProfile={initialProfile} />
          {children}
        </div>
      </MenuVisibleLayout>
    </HydrationBoundary>
  )
}
