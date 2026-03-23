'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { Card, deleteCard } from '@/entities/card'
import { useOptimisticActiveCardCount, useUserId } from '@/entities/user'
import { useInfiniteMyCardList } from '@/features/my-card'
import { formatDate, StatusMessage } from '@/shared'

import { MyCardListSkeleton } from './MyCardListSkeleton'

import type { CategoryItemType } from '@/entities/category'
import type { KeywordItemType } from '@/entities/keyword'

const LIST_CLASSNAME = 'mt-4 flex min-h-0 flex-col items-center gap-4 overflow-y-auto max-h-[60vh]'
const ACTIVE_CARD_COUNT_DECREMENT = -1
const INFINITE_SCROLL_ROOT_MARGIN = '200px'
const INFINITE_SCROLL_THRESHOLD = 0.1
const LOAD_MORE_SKELETON_CLASSNAME = 'h-14 w-80 animate-pulse rounded-xl bg-gray-200/80'

type MyCardListProps = {
  selectedCategory: CategoryItemType | null
  selectedKeyword: KeywordItemType | null
}

export function MyCardList({ selectedCategory, selectedKeyword }: MyCardListProps) {
  const router = useRouter()
  const userId = useUserId()
  const { applyDeltaWithRollback } = useOptimisticActiveCardCount()
  // 무한 스크롤 데이터/상태를 한 번에 가져온다.
  const { data, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteMyCardList(userId)
  // 내부 스크롤 컨테이너를 root로 사용하기 위한 ref다.
  const listContainerRef = useRef<HTMLDivElement | null>(null)
  // 화면 하단 sentinel 요소를 관찰해 다음 페이지를 자동 요청한다.
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const triggerElement = loadMoreTriggerRef.current
    if (!triggerElement) return
    if (!hasNextPage) return

    // sentinel이 리스트 스크롤 영역에 들어오면 fetchNextPage를 실행한다.
    const observer = new IntersectionObserver(
      (entries) => {
        const targetEntry = entries[0]
        if (!targetEntry?.isIntersecting) return
        if (isFetchingNextPage) return

        void fetchNextPage()
      },
      {
        // 리스트가 자체 스크롤 영역이므로 viewport 대신 컨테이너를 관찰 root로 사용한다.
        root: listContainerRef.current,
        rootMargin: INFINITE_SCROLL_ROOT_MARGIN,
        threshold: INFINITE_SCROLL_THRESHOLD,
      },
    )

    observer.observe(triggerElement)

    return () => {
      observer.disconnect()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  if (isLoading) {
    return <MyCardListSkeleton />
  }

  if (error) {
    return <StatusMessage message="학습 기록을 불러오지 못했습니다." />
  }

  // 페이지 단위 응답을 하나의 카드 배열로 평탄화한다.
  const allCards = data?.pages.flatMap((page) => page.cards) ?? []

  if (allCards.length === 0 && !hasNextPage) {
    return <StatusMessage message="최근 학습한 기록이 없습니다." />
  }

  // 카테고리/키워드 필터가 하나라도 선택되면 클라이언트 필터링을 적용한다.
  const shouldFilter = Boolean(selectedCategory) || Boolean(selectedKeyword)
  const filteredCards = shouldFilter
    ? allCards.filter((card) => {
        if (selectedCategory && card.categoryName !== selectedCategory.categoryName) return false
        if (selectedKeyword && card.keywordName !== selectedKeyword.keywordName) return false
        return true
      })
    : allCards

  if (filteredCards.length === 0 && !hasNextPage && !isFetchingNextPage) {
    return <StatusMessage message="조건에 맞는 카드가 없습니다." />
  }

  return (
    <div
      ref={listContainerRef}
      className={LIST_CLASSNAME}
    >
      {filteredCards.map((card) => (
        <Card
          key={card.id}
          title={card.title}
          date={formatDate(card.createdAt)}
          categoryName={card.categoryName}
          keywordName={card.keywordName}
          onClick={() => router.push(`/mypage/cards/${card.id}`)}
          onDelete={async () => {
            // 삭제 버튼 클릭 시 목록 카운트를 낙관적 갱신한다.
            const rollback = applyDeltaWithRollback(ACTIVE_CARD_COUNT_DECREMENT)
            const deleted = await deleteCard(card.id)
            if (deleted) {
              // 삭제 성공 시 목록을 새로고침한다.
              await refetch()
              return
            }
            // 삭제 실패 시 카운트 변경을 되돌린다.
            rollback()
          }}
        />
      ))}
      {isFetchingNextPage ? <div className={LOAD_MORE_SKELETON_CLASSNAME} /> : null}
      {/* hasNextPage일 때만 sentinel을 렌더링해 관찰을 활성화한다. */}
      {hasNextPage ? (
        <div
          ref={loadMoreTriggerRef}
          className="h-1 w-full"
          aria-hidden="true"
        />
      ) : null}
    </div>
  )
}
