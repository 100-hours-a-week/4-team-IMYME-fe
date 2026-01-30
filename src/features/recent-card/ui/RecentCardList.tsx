'use client'

import { useRouter } from 'next/navigation'

import { Card, deleteCard } from '@/entities/card'
import { useUserId } from '@/entities/user/model/useUserStore'
import { useAccessToken } from '@/features/auth/model/client/useAuthStore'
import { useMyCardList } from '@/features/my-card/model/useMyCardList'
import { formatDate } from '@/shared'

const LIST_CLASSNAME = 'mt-5 flex flex-col items-center gap-4'
const COMMENT_CLASSNAME = 'mt-10 text-center'

const RECENT_LIMIT = 3

export function RecentCardList() {
  const router = useRouter()
  const accessToken = useAccessToken()
  const userId = useUserId()
  const { data = [], isLoading, error, refetch } = useMyCardList(accessToken, userId, RECENT_LIMIT)

  if (isLoading) {
    return <p className={COMMENT_CLASSNAME}>학습 기록을 불러오는 중입니다...</p>
  }

  if (error) {
    return <p className={COMMENT_CLASSNAME}>학습 기록을 불러오지 못했습니다.</p>
  }

  const recentCards = data

  if (recentCards.length === 0) {
    return <p className={COMMENT_CLASSNAME}>최근 학습한 기록이 없습니다.</p>
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
            const deleted = await deleteCard(accessToken, card.id)
            if (deleted) {
              await refetch()
            }
          }}
        />
      ))}
    </div>
  )
}
