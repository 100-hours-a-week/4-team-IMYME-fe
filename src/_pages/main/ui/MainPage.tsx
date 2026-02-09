'use client'

import { useEffect } from 'react'

import { useMyProfileQuery, useProfile, useSetProfile } from '@/entities/user'
import { useAccessToken } from '@/features/auth'
import { ModeButton } from '@/features/mode'
import { RecentCardList } from '@/features/recent-card'
import { RecentListHeader } from '@/shared'
import { ProfileDashboard } from '@/widgets/profile'

export function MainPage() {
  const accessToken = useAccessToken()
  const profile = useProfile()
  const setProfile = useSetProfile()
  const { data: myProfile } = useMyProfileQuery(accessToken, { enabled: Boolean(accessToken) })

  useEffect(() => {
    if (!accessToken || profile.id || !myProfile) {
      return
    }

    setProfile(myProfile)
  }, [accessToken, myProfile, profile.id, setProfile])

  return (
    <>
      <ProfileDashboard />
      <ModeButton variant="levelup" />
      <RecentListHeader variant="levelup" />
      <RecentCardList />
    </>
  )
}
