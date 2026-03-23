import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import { getMyChallengeResult } from '../api/getMyChallengeResult'

import type { MyChallengeResultData } from '../api/getMyChallengeResult'

const CHALLENGE_RESULT_QUERY_KEY = 'challenge-result'
const MINUTE_IN_MS = 60_000
const HOUR_IN_MINUTES = 60
const DAY_IN_HOURS = 24
const CHALLENGE_RESULT_STALE_TIME_MINUTES = DAY_IN_HOURS * HOUR_IN_MINUTES
const CHALLENGE_RESULT_STALE_TIME_MS = CHALLENGE_RESULT_STALE_TIME_MINUTES * MINUTE_IN_MS

type UseMyChallengeResultOptions = {
  enabled?: boolean
}

export const buildMyChallengeResultQueryKey = (challengeId: number) =>
  [CHALLENGE_RESULT_QUERY_KEY, challengeId] as const

const getMyChallengeResultOrThrow = async (challengeId: number): Promise<MyChallengeResultData> => {
  const result = await getMyChallengeResult(challengeId)

  if (!result.ok) {
    throw new Error(result.reason)
  }

  return result.data
}

export function useMyChallengeResult(
  challengeId: number,
  options?: UseMyChallengeResultOptions,
): UseQueryResult<MyChallengeResultData, Error> {
  const enabled = options?.enabled ?? true

  return useQuery<MyChallengeResultData, Error>({
    queryKey: buildMyChallengeResultQueryKey(challengeId),
    queryFn: () => getMyChallengeResultOrThrow(challengeId),
    enabled,
    retry: false,
    staleTime: CHALLENGE_RESULT_STALE_TIME_MS,
  })
}
