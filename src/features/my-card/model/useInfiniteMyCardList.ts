import { useInfiniteQuery } from '@tanstack/react-query'

import { getMyCardsPage } from '../api/getMyCards'

// 마이페이지 카드 목록은 5개 단위로 커서 기반 페이지네이션을 사용한다.
export const MY_CARD_PAGE_SIZE = 5
const MY_CARDS_STALE_TIME_MS = 60_000
const INITIAL_CURSOR = null as string | null

// 사용자별 + 페이지 크기별로 캐시를 분리한다.
export const buildInfiniteMyCardsQueryKey = (userId: number) =>
  ['myCardsInfinite', userId, MY_CARD_PAGE_SIZE] as const

export function useInfiniteMyCardList(userId: number) {
  return useInfiniteQuery({
    // 같은 사용자의 무한 목록은 동일 query key를 사용한다.
    queryKey: buildInfiniteMyCardsQueryKey(userId),
    // userId가 없으면 서버 요청을 보내지 않는다.
    enabled: Boolean(userId),
    // 첫 요청은 cursor 없이 시작한다.
    initialPageParam: INITIAL_CURSOR,
    // 페이지 파라미터(cursor)를 그대로 API에 전달한다.
    queryFn: ({ pageParam }) =>
      getMyCardsPage({
        limit: MY_CARD_PAGE_SIZE,
        cursor: pageParam,
      }),
    // 서버가 hasNext=false 이거나 nextCursor가 없으면 다음 페이지 요청을 중단한다.
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination.hasNext) return undefined
      if (!lastPage.pagination.nextCursor) return undefined
      return lastPage.pagination.nextCursor
    },
    // 일정 시간 동안은 신선 데이터로 간주해 불필요한 재요청을 줄인다.
    staleTime: MY_CARDS_STALE_TIME_MS,
  })
}
