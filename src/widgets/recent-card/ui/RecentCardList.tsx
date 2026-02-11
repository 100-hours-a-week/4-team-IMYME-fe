'use client'

import { useRouter } from 'next/navigation'

import { Card, deleteCard } from '@/entities/card'
import { useOptimisticActiveCardCount, useUserId } from '@/entities/user'
import { useAccessToken } from '@/features/auth'
import { useMyCardList } from '@/features/my-card'
import { formatDate, StatusMessage } from '@/shared'

const LIST_CLASSNAME = 'mt-5 flex flex-col items-center gap-4'
const RECENT_LIMIT = 3
const ACTIVE_CARD_COUNT_DECREMENT = -1

export function RecentCardList() {
  const router = useRouter()
  const accessToken = useAccessToken()
  const userId = useUserId()
  const { applyDeltaWithRollback } = useOptimisticActiveCardCount()
  const { data = [], isLoading, error, refetch } = useMyCardList(accessToken, userId, RECENT_LIMIT)

  if (isLoading) {
    return <StatusMessage message="학습 기록을 불러오는 중입니다..." />
  }

  if (error) {
    return <StatusMessage message="학습 기록을 불러오지 못했습니다." />
  }

  const recentCards = data

  if (recentCards.length === 0) {
    return <StatusMessage message="최근 학습한 기록이 없습니다." />
  }

  return (
    <div className={LIST_CLASSNAME}>
      {recentCards.map((card) => (
        <Card
          key={card.id}
          title={card.title}
          date={formatDate(card.createdAt)}
          categoryName={card.categoryName}
          keywordName={card.keywordName}
          onClick={() => router.push('/mypage')}
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
