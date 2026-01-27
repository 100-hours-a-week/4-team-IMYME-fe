'use client'

import { useQuery } from '@tanstack/react-query'

import { getKeywords } from './getKeywords'

import type { KeywordItemType } from '@/entities/keyword'

type UseKeywordListOptions = {
  categoryId: number | null
  accessToken: string
}

export function useKeywordList({ categoryId, accessToken }: UseKeywordListOptions) {
  return useQuery<KeywordItemType[]>({
    queryKey: ['keywords', categoryId, accessToken],
    queryFn: () => getKeywords(accessToken, categoryId),
    enabled: Boolean(accessToken) && categoryId !== null,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  })
}
