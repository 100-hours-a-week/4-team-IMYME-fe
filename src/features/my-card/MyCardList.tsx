'use client'

import { useRouter } from 'next/navigation'

import { Card, deleteCard } from '@/entities/card'
import { useUserId } from '@/entities/user/model/useUserStore'
import { useAccessToken } from '@/features/auth/model/client/useAuthStore'
import { useMyCardList } from '@/features/my-card/model/useMyCardList'
import { formatDate } from '@/shared'

import type { CategoryItemType } from '@/entities/category'
import type { KeywordItemType } from '@/entities/keyword'

const LIST_CLASSNAME = 'mt-4 flex min-h-0 flex-col items-center gap-4 overflow-y-auto max-h-[60vh]'
const COMMENT_CLASSNAME = 'mt-10 text-center'

type MyCardListProps = {
  selectedCategory: CategoryItemType | null
  selectedKeyword: KeywordItemType | null
}

export function MyCardList({ selectedCategory, selectedKeyword }: MyCardListProps) {
  const router = useRouter()
  const accessToken = useAccessToken()
  const userId = useUserId()
  const { data, isLoading, error, refetch } = useMyCardList(accessToken, userId)

  if (isLoading) {
    return <p className={COMMENT_CLASSNAME}>학습 기록을 불러오는 중입니다...</p>
  }

  if (error) {
    return <p className={COMMENT_CLASSNAME}>학습 기록을 불러오지 못했습니다.</p>
  }

  if (data?.length === 0) {
    return <p className={COMMENT_CLASSNAME}>최근 학습한 기록이 없습니다.</p>
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
    return <p className={COMMENT_CLASSNAME}>조건에 맞는 카드가 없습니다.</p>
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
