'use client'

import { useQuery } from '@tanstack/react-query'

import { getMyProfile } from '@/entities/user'

import type { UserProfile } from './userProfile'

type UseMyProfileQueryOptions = {
  enabled?: boolean
}

type UseMyProfileQueryResult = {
  data?: UserProfile
  isLoading: boolean
  isError: boolean
}

export function useMyProfileQuery(
  accessToken: string | null,
  options?: UseMyProfileQueryOptions,
): UseMyProfileQueryResult {
  const enabled = options?.enabled ?? true

  const query = useQuery({
    queryKey: ['myProfile'],
    enabled: Boolean(accessToken) && enabled,
    queryFn: async () => {
      if (!accessToken) {
        return undefined
      }
      const result = await getMyProfile(accessToken)
      if (!result.ok) {
        throw new Error(result.reason)
      }
      return result.data
    },
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
