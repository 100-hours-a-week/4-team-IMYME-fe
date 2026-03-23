'use client'

import { ChevronLeft } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

import { Avatar, Nickname, StatCards, useMyProfileQuery } from '@/entities/user'

import type { UserProfile } from '@/entities/user'

const AVATAR_SIZE_PX = 60
const FALLBACK_NICKNAME = '로딩중...'
const FALLBACK_STAT_VALUE = 0
const MAIN_PAGE_PATH = '/main'
const MY_PAGE_PATH = '/mypage'
const EMPTY_PROFILE = {
  id: 0,
  nickname: '',
  profileImageUrl: '',
  level: 0,
  activeCardCount: 0,
  consecutiveDays: 1,
  winCount: 0,
} as const

interface ProfileDashboardProps {
  // layout이 서버에서 먼저 가져온 프로필
  initialProfile?: UserProfile | null
  deferAvatarImageUntilProfileReady?: boolean
}

export function ProfileDashboard({
  initialProfile,
  deferAvatarImageUntilProfileReady = false,
}: ProfileDashboardProps) {
  const router = useRouter()
  const pathname = usePathname()

  // hydration 이후에는 client query가 최신 프로필을 계속 가져온다.
  const { data: myProfile } = useMyProfileQuery({
    initialData: initialProfile ?? undefined,
  })
  // 첫 렌더는 initialProfile, 이후에는 query 값을 우선 사용한다.
  const resolvedProfile = myProfile ?? initialProfile ?? EMPTY_PROFILE

  const isMainPage = pathname === MAIN_PAGE_PATH
  const isMyPage = pathname === MY_PAGE_PATH
  // 닉네임 또는 이미지가 하나라도 있으면 프로필이 준비된 것으로 본다.
  const isProfileReady = Boolean(resolvedProfile.nickname || resolvedProfile.profileImageUrl)
  const shouldDeferAvatarImage = deferAvatarImageUntilProfileReady && !myProfile
  const avatarSrcForRender = shouldDeferAvatarImage ? '' : resolvedProfile.profileImageUrl

  return (
    <div className="relative w-full">
      <div
        className={['absolute rounded-md p-1', isMyPage ? '' : 'invisible'].join(' ')}
        onClick={() => {
          router.push('/main')
        }}
      >
        <ChevronLeft />
      </div>

      <div
        className="w-full cursor-pointer"
        onClick={() => {
          if (isMainPage) router.push('/mypage')
        }}
      >
        <div className="grid w-full auto-cols-max grid-flow-col items-start gap-4">
          <div
            className="ml-10 overflow-hidden rounded-full"
            style={{ width: AVATAR_SIZE_PX, height: AVATAR_SIZE_PX }}
          >
            <Avatar
              avatar_src={avatarSrcForRender}
              size={AVATAR_SIZE_PX}
            />
          </div>
          <Nickname nickname={isProfileReady ? resolvedProfile.nickname : FALLBACK_NICKNAME} />
        </div>

        <StatCards
          cardCount={isProfileReady ? resolvedProfile.activeCardCount : FALLBACK_STAT_VALUE}
          winCount={isProfileReady ? resolvedProfile.winCount : FALLBACK_STAT_VALUE}
          levelCount={isProfileReady ? resolvedProfile.level : FALLBACK_STAT_VALUE}
        />
      </div>
    </div>
  )
}
