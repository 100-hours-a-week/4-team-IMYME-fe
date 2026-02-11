'use client'

import { UsersRound, UserPlus, ChevronsRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { MatchingSelectButton } from '@/features/pvp'
import { ModeHeader, RecentListHeader } from '@/shared'
import { RecentPvPList } from '@/widgets/recent-pvp'

export function PvPPage() {
  const router = useRouter()

  const LEADING_ICON_CLASSNAME = '!size-6'
  const TRAILING_ICON_CLASSNAME = '!size-6'

  const handleBack = () => {
    router.back()
  }
  return (
    <div className="h-full w-full">
      <ModeHeader
        mode="pvp"
        step="matching_list"
        onBack={handleBack}
      />
      <div>
        <div className="mt-5 grid w-full auto-cols-max grid-cols-2 items-center">
          <p className="mr-auto ml-10 text-base">참여 가능한 매칭 방</p>
        </div>
        <div className="mt-5 flex h-full w-full flex-col items-center justify-center gap-6">
          <MatchingSelectButton
            variant="enter"
            icon={<UsersRound className={`mr-4 ml-2 ${LEADING_ICON_CLASSNAME}`} />}
            trailingIcon={<ChevronsRight className={TRAILING_ICON_CLASSNAME} />}
            onClick={() => router.push('/pvp/rooms')}
          />
          <MatchingSelectButton
            variant="create"
            icon={<UserPlus className={`mr-4 ml-2 ${LEADING_ICON_CLASSNAME}`} />}
            trailingIcon={<ChevronsRight className={TRAILING_ICON_CLASSNAME} />}
          />
        </div>
        <RecentListHeader variant="pvp" />
        <RecentPvPList />
      </div>
    </div>
  )
}
