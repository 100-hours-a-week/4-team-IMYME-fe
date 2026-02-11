'use client'

import { useEffect } from 'react'

import { useMyProfileQuery, useProfile, useSetProfile } from '@/entities/user'
import { useAccessToken } from '@/features/auth'
import { ModeButton } from '@/features/mode'
import { RecentListHeader } from '@/shared'
import { ProfileDashboard } from '@/widgets/profile'
import { RecentCardList } from '@/widgets/recent-card'
import { RecentPvPList } from '@/widgets/recent-pvp'

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
    <div className="flex h-full w-full flex-col pb-6">
      <ProfileDashboard />
      <div className="mt-10 flex flex-col gap-6 pb-5">
        <ModeButton variant="levelup" />
        {process.env.NEXT_PUBLIC_PVP_OPEN === 'true' ? <ModeButton variant="pvp" /> : null}
      </div>
      <RecentListHeader variant="levelup" />
      <RecentCardList />
      {process.env.NEXT_PUBLIC_PVP_OPEN !== 'true' ? null : (
        <>
          <RecentListHeader variant="pvp" />
          <RecentPvPList />
        </>
      )}
    </div>
  )
}
