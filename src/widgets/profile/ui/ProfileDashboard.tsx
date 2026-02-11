'use client'

import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Avatar, Nickname, StatCards } from '@/entities/user'
import { useProfile } from '@/entities/user/model/useUserStore'

const AVATAR_SIZE_PX = 60

interface ProfileDashboardProps {
  navigateToMyPage?: boolean
  showBackButton?: boolean
}

export function ProfileDashboard({
  navigateToMyPage = true,
  showBackButton = false,
}: ProfileDashboardProps) {
  const router = useRouter()

  const profile = useProfile()

  const handleNavigateToMyPage = () => {
    if (!navigateToMyPage) {
      return
    }

    router.push('/mypage')
  }

  const handleBackButton = () => {
    if (!showBackButton) return

    router.back()
  }

  return (
    <div className="relative w-full">
      <div
        className={['absolute rounded-md p-1', showBackButton ? '' : 'invisible'].join(' ')}
        onClick={handleBackButton}
      >
        <ChevronLeft />
      </div>
      <div
        className="w-full cursor-pointer"
        onClick={handleNavigateToMyPage}
      >
        <div className="grid w-full auto-cols-max grid-flow-col items-start gap-4">
          <div
            className="ml-10 overflow-hidden rounded-full"
            style={{ width: AVATAR_SIZE_PX, height: AVATAR_SIZE_PX }}
          >
            <Avatar
              avatar_src={profile.profileImageUrl}
              size={AVATAR_SIZE_PX}
            />
          </div>
          <Nickname nickname={profile.nickname} />
        </div>
        <StatCards
          cardCount={profile.activeCardCount}
          winCount={profile.winCount}
          levelCount={profile.level}
        />
      </div>
    </div>
  )
}
