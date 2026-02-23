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
  // 외부에서 쿼리 활성/비활성 제어
  const enabled = options?.enabled ?? true

  // ✅ 내 프로필 조회 쿼리
  const query = useQuery({
    queryKey: ['myProfile'],
    // accessToken이 있을 때만 실행 + 외부 enabled 반영
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
    // 1분 동안은 fresh로 간주해 불필요한 재요청 방지
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // 컴포넌트에 필요한 최소 상태만 반환
  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
