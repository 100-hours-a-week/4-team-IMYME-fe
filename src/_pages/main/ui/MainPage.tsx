'use client'

import { useMyProfileQuery, useProfile, useSyncMyProfile } from '@/entities/user'
import { useAccessToken } from '@/features/auth'
import { ModeButton } from '@/features/mode'
import { RecentListHeader } from '@/shared'
import { ProfileDashboard } from '@/widgets/profile'
import { RecentCardList } from '@/widgets/recent-card'
import { RecentPvPList } from '@/widgets/recent-pvp'

export function MainPage() {
  // 인증 토큰/프로필 store/서버 프로필 쿼리
  const accessToken = useAccessToken()
  const profile = useProfile()
  const { data: myProfile } = useMyProfileQuery(accessToken, { enabled: Boolean(accessToken) })
  useSyncMyProfile({ accessToken, myProfile })

  // ✅ 렌더는 myProfile 우선 사용 (store 채우기 기다리지 않음)
  const uiProfile = myProfile ?? profile

  return (
    <div className="flex w-full flex-1 flex-col pb-6">
      {/* 프로필 상단 영역 */}
      <ProfileDashboard profile={uiProfile} />
      <div className="mt-10 flex flex-col gap-6 pb-5">
        {/* 학습/대결 모드 버튼 */}
        <ModeButton variant="levelup" />
        {process.env.NEXT_PUBLIC_PVP_OPEN === 'true' ? <ModeButton variant="pvp" /> : null}
      </div>
      {/* 최근 학습 목록 */}
      <RecentListHeader variant="levelup" />
      <RecentCardList />
      {process.env.NEXT_PUBLIC_PVP_OPEN !== 'true' ? null : (
        <>
          {/* 최근 대결 목록 */}
          <RecentListHeader variant="pvp" />
          <RecentPvPList />
        </>
      )}
    </div>
  )
}
