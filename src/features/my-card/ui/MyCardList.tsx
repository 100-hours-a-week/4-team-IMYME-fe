'use client'

import { useRouter } from 'next/navigation'

import { Card, deleteCard } from '@/entities/card'
import { useOptimisticActiveCardCount, useUserId } from '@/entities/user'
import { useAccessToken } from '@/features/auth'
import { useMyCardList } from '@/features/my-card'
import { formatDate, StatusMessage } from '@/shared'

import type { CategoryItemType } from '@/entities/category'
import type { KeywordItemType } from '@/entities/keyword'

const LIST_CLASSNAME = 'mt-4 flex min-h-0 flex-col items-center gap-4 overflow-y-auto max-h-[60vh]'
const ACTIVE_CARD_COUNT_DECREMENT = -1

type MyCardListProps = {
  selectedCategory: CategoryItemType | null
  selectedKeyword: KeywordItemType | null
}

export function MyCardList({ selectedCategory, selectedKeyword }: MyCardListProps) {
  const router = useRouter()
  const accessToken = useAccessToken()
  const userId = useUserId()
  const { applyDeltaWithRollback } = useOptimisticActiveCardCount()
  const { data, isLoading, error, refetch } = useMyCardList(accessToken, userId)

  if (isLoading) {
    return <StatusMessage message="학습 기록을 불러오는 중입니다..." />
  }

  if (error) {
    return <StatusMessage message="학습 기록을 불러오지 못했습니다." />
  }

  if (data?.length === 0) {
    return <StatusMessage message="최근 학습한 기록이 없습니다." />
  }

  const shouldFilter = Boolean(selectedCategory) || Boolean(selectedKeyword)
  const filteredCards = shouldFilter
    ? data?.filter((card) => {
        if (selectedCategory && card.categoryName !== selectedCategory.categoryName) return false
        if (selectedKeyword && card.keywordName !== selectedKeyword.keywordName) return false
        return true
      })
    : data

  if (filteredCards?.length === 0) {
    return <StatusMessage message="조건에 맞는 카드가 없습니다." />
  }

  return (
    <div className={LIST_CLASSNAME}>
      {filteredCards?.map((card) => (
        <Card
          key={card.id}
          title={card.title}
          date={formatDate(card.createdAt)}
          categoryName={card.categoryName}
          keywordName={card.keywordName}
          onClick={() => router.push(`/mypage/cards/${card.id}`)}
          onDelete={async () => {
            const rollback = applyDeltaWithRollback(ACTIVE_CARD_COUNT_DECREMENT)
            const deleted = await deleteCard(accessToken, card.id)
            if (deleted) {
              await refetch()
              return
            }
            rollback()
          }}
        />
      ))}
    </div>
  )
}
