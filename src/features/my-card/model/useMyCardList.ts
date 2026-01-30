import { useQuery } from '@tanstack/react-query'

import { getMyCards } from '../api/getMyCards'

import type { MyCardItem } from '../api/getMyCards'

export function useMyCardList(accessToken: string, userId: number, limit?: number) {
  return useQuery<MyCardItem[]>({
    queryKey: ['myCards', userId, limit],
    queryFn: () => getMyCards(accessToken, limit),
    enabled: Boolean(accessToken),
  })
}
