import { QueryClient, dehydrate } from '@tanstack/react-query'
import { cookies } from 'next/headers'

import { MY_PROFILE_QUERY_KEY, getInitialMyProfile } from '@/entities/user'
import { ACCESS_TOKEN_COOKIE } from '@/features/auth/server'
import { ProfilePagesLayout } from '@/widgets/layouts'

import type { ReactNode } from 'react'

type ProfilePagesRouteLayoutProps = {
  children: ReactNode
}

const SHOULD_LOG_PROFILE_LAYOUT = process.env.NODE_ENV === 'development'

const logProfileLayout = (message: string, payload?: Record<string, unknown>) => {
  if (!SHOULD_LOG_PROFILE_LAYOUT) {
    return
  }

  if (payload) {
    console.info(`[profile-pages-layout] ${message}`, payload)
    return
  }

  console.info(`[profile-pages-layout] ${message}`)
}

const getInitialProfile = async () => {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? ''
  if (!accessToken) {
    logProfileLayout('access_token cookie missing. skip server prefetch')
    return null
  }

  // 서버 레이아웃은 refresh가 끝난 access token cookie만 사용해 초기 프로필을 만든다.
  const profileResult = await getInitialMyProfile(accessToken)
  if (!profileResult.ok) {
    logProfileLayout('server prefetch failed', { reason: profileResult.reason })
    return null
  }

  logProfileLayout('server prefetch success', { profileId: profileResult.profile.id })
  return profileResult.profile
}

export default async function ProfilePagesRouteLayout({ children }: ProfilePagesRouteLayoutProps) {
  // main/mypage 최초 HTML에는 서버가 선조회한 프로필을 바로 주입한다.
  const initialProfile = await getInitialProfile()
  const queryClient = new QueryClient()

  if (initialProfile) {
    queryClient.setQueryData(MY_PROFILE_QUERY_KEY, initialProfile)
    logProfileLayout('seeded query cache from server prefetch', {
      profileId: initialProfile.id,
    })
  } else {
    logProfileLayout('no initial profile to seed')
  }

  const dehydratedState = dehydrate(queryClient)

  return (
    <ProfilePagesLayout
      initialProfile={initialProfile}
      dehydratedState={dehydratedState}
    >
      {children}
    </ProfilePagesLayout>
  )
}
