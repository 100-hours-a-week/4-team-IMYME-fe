import { useQuery } from '@tanstack/react-query'

import { getMyCards } from '../api/getMyCards'

import type { MyCardItem } from '../api/getMyCards'

export const MY_CARDS_STALE_TIME_MS = 60_000

export const buildMyCardsQueryKey = (userId: number, limit?: number) =>
  ['myCards', userId, limit] as const

export function useMyCardList(userId: number, limit?: number) {
  return useQuery<MyCardItem[]>({
    queryKey: buildMyCardsQueryKey(userId, limit),
    queryFn: () => getMyCards(limit),
    staleTime: MY_CARDS_STALE_TIME_MS,
  })
}
