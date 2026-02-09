'use client'

import { useEffect } from 'react'

import { getMyProfile } from '@/entities/user'
import { useProfile, useSetProfile } from '@/entities/user/model/useUserStore'
import { useAccessToken } from '@/features/auth'
import { ModeButton } from '@/features/mode'
import { RecentCardList } from '@/features/recent-card/ui/RecentCardList'
import { RecentListHeader } from '@/shared'
import { ProfileDashboard } from '@/widgets/profile'

export function MainPage() {
  const accessToken = useAccessToken()
  const profile = useProfile()
  const setProfile = useSetProfile()

  useEffect(() => {
    if (!accessToken || profile.id) {
      return
    }

    const run = async () => {
      const result = await getMyProfile(accessToken)
      if (!result.ok) {
        return
      }
      setProfile(result.data)
    }

    void run()
  }, [accessToken, profile.id, setProfile])

  return (
    <>
      <ProfileDashboard />
      <ModeButton variant="levelup" />
      <RecentListHeader variant="levelup" />
      <RecentCardList />
    </>
  )
}
