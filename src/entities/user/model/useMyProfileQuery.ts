'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { getMyProfile } from '@/entities/user'

import { MY_PROFILE_QUERY_KEY } from './myProfileQueryKey'

import type { UserProfile } from './userProfile'

type UseMyProfileQueryOptions = {
  enabled?: boolean
  initialData?: UserProfile
}

type UseMyProfileQueryResult = {
  data?: UserProfile
  isLoading: boolean
  isError: boolean
}

const PROFILE_QUERY_STALE_TIME_MINUTES = 10
const ONE_MINUTE_IN_MILLISECONDS = 60_000
const PROFILE_QUERY_STALE_TIME_MS = PROFILE_QUERY_STALE_TIME_MINUTES * ONE_MINUTE_IN_MILLISECONDS
const DEBUG_MY_PROFILE_QUERY_STORAGE_KEY = 'debug_my_profile_query_logs'
const SHOULD_LOG_MY_PROFILE_QUERY_BY_ENV =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_DEBUG_MY_PROFILE_QUERY === 'true'

const logMyProfileQuery = (message: string, payload?: Record<string, unknown>) => {
  const shouldLogByStorage =
    typeof window !== 'undefined' &&
    window.localStorage.getItem(DEBUG_MY_PROFILE_QUERY_STORAGE_KEY) === 'true'
  const shouldLog = SHOULD_LOG_MY_PROFILE_QUERY_BY_ENV || shouldLogByStorage

  if (!shouldLog) {
    return
  }

  if (payload) {
    console.info(`[my-profile-query] ${message}`, payload)
    return
  }

  console.info(`[my-profile-query] ${message}`)
}

export function useMyProfileQuery(options?: UseMyProfileQueryOptions): UseMyProfileQueryResult {
  // 외부에서 쿼리 활성/비활성 제어
  const enabled = options?.enabled ?? true
  const initialData = options?.initialData
  const queryClient = useQueryClient()
  const cachedProfile = queryClient.getQueryData<UserProfile>(MY_PROFILE_QUERY_KEY)

  const query = useQuery({
    queryKey: MY_PROFILE_QUERY_KEY,
    enabled,
    initialData,
    queryFn: async () => {
      logMyProfileQuery('queryFn start (/proxy-api/users/me request)', {
        enabled,
      })
      const result = await getMyProfile()
      if (!result.ok) {
        logMyProfileQuery('queryFn failed', { reason: result.reason })
        throw new Error(result.reason)
      }
      logMyProfileQuery('queryFn success', {
        profileId: result.data.id,
      })
      return result.data
    },
    // 10분 동안은 fresh로 간주해 불필요한 재요청 방지
    staleTime: PROFILE_QUERY_STALE_TIME_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  useEffect(() => {
    logMyProfileQuery('hook mounted', {
      enabled,
      hasInitialData: Boolean(initialData),
      hasCachedProfile: Boolean(cachedProfile),
    })
  }, [enabled, initialData, cachedProfile])

  useEffect(() => {
    logMyProfileQuery('state changed', {
      status: query.status,
      fetchStatus: query.fetchStatus,
      hasData: Boolean(query.data),
    })
  }, [query.status, query.fetchStatus, query.data])

  // 컴포넌트에 필요한 최소 상태만 반환
  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
