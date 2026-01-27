'use client'

import { useQuery } from '@tanstack/react-query'

import { getCategories } from './getCategories'

import type { CategoryItemType } from '@/entities/category'

export function useCategoryList(accessToken: string) {
  return useQuery<CategoryItemType[]>({
    queryKey: ['categories', accessToken],
    queryFn: () => getCategories(accessToken),
    enabled: Boolean(accessToken),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  })
}
