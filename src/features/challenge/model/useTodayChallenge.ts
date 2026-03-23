import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import { getTodayChallenge } from '../api/getTodayChallenge'

import type { TodayChallengeData } from '../api/getTodayChallenge'

const OPEN_CHALLENGE_STATUS = 'OPEN'
const CHALLENGE_TODAY_QUERY_KEY_PREFIX = ['challenge', 'today'] as const
const HOUR_IN_MS = 60 * 60 * 1000
const CHALLENGE_TODAY_STALE_TIME_MS = 2 * HOUR_IN_MS
const CHALLENGE_TODAY_GC_TIME_MS = HOUR_IN_MS
const CLOSED_CHALLENGE_ERROR_PREFIX = 'challenge_not_open'
const CHALLENGE_DATE_SLICE_START = 0
const CHALLENGE_DATE_SLICE_END = 10

const getChallengeDateKey = () =>
  new Date().toISOString().slice(CHALLENGE_DATE_SLICE_START, CHALLENGE_DATE_SLICE_END)

const buildTodayChallengeQueryKey = (challengeDate: string) =>
  [...CHALLENGE_TODAY_QUERY_KEY_PREFIX, challengeDate] as const

const getTodayChallengeOrThrow = async (): Promise<TodayChallengeData> => {
  const result = await getTodayChallenge()

  if (!result.ok) {
    throw new Error(result.reason)
  }

  if (result.data.status !== OPEN_CHALLENGE_STATUS) {
    throw new Error(`${CLOSED_CHALLENGE_ERROR_PREFIX}:${result.data.status}`)
  }

  return result.data
}

type UseTodayChallengeOptions = {
  enabled?: boolean
}

export function useTodayChallenge(
  options?: UseTodayChallengeOptions,
): UseQueryResult<TodayChallengeData, Error> {
  const challengeDateKey = getChallengeDateKey()

  return useQuery<TodayChallengeData, Error>({
    queryKey: buildTodayChallengeQueryKey(challengeDateKey),
    queryFn: getTodayChallengeOrThrow,
    enabled: options?.enabled,
    retry: false,
    staleTime: CHALLENGE_TODAY_STALE_TIME_MS,
    gcTime: CHALLENGE_TODAY_GC_TIME_MS,
  })
}
