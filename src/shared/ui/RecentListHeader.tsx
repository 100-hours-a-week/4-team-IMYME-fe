'use client'

import { useRouter } from 'next/navigation'

import { Button } from './button'

const RECENT_LIST_LABELS = {
  levelup: '최근 학습',
  pvp: '최근 대결',
} as const

type RecentListVariant = keyof typeof RECENT_LIST_LABELS

type RecentListHeaderProps = {
  variant: RecentListVariant
}

export function RecentListHeader({ variant }: RecentListHeaderProps) {
  const label = RECENT_LIST_LABELS[variant]

  const router = useRouter()

  const handleSeeMore = () => {
    router.push('/mypage')
  }

  return (
    <div className="mt-5 grid w-full auto-cols-max grid-cols-2 items-center">
      <p className="mr-auto ml-10 text-base">{label}</p>
      <Button
        variant={'see_more'}
        onClick={handleSeeMore}
      >
        더보기
      </Button>
    </div>
  )
}
