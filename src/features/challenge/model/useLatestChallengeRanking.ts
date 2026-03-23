import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import { getLatestChallengeRanking } from '../api/getLatestChallengeRanking'

import type {
  GetLatestChallengeRankingParams,
  LatestChallengeRankingData,
} from '../api/getLatestChallengeRanking'

const LATEST_CHALLENGE_RANKING_QUERY_KEY_PREFIX = ['challenge', 'latest-ranking'] as const
const MINUTE_IN_MS = 60_000
const HOUR_IN_MINUTES = 60
const DAY_IN_HOURS = 2
const LATEST_CHALLENGE_RANKING_STALE_TIME_MINUTES = DAY_IN_HOURS * HOUR_IN_MINUTES
const LATEST_CHALLENGE_RANKING_GC_TIME_MINUTES = 10
const LATEST_CHALLENGE_RANKING_STALE_TIME_MS =
  LATEST_CHALLENGE_RANKING_STALE_TIME_MINUTES * MINUTE_IN_MS
const LATEST_CHALLENGE_RANKING_GC_TIME_MS = LATEST_CHALLENGE_RANKING_GC_TIME_MINUTES * MINUTE_IN_MS
const EMPTY_QUERY_PARAM_KEY = null

type UseLatestChallengeRankingOptions = GetLatestChallengeRankingParams & {
  enabled?: boolean
}

const buildLatestChallengeRankingQueryKey = (params: GetLatestChallengeRankingParams) =>
  [
    ...LATEST_CHALLENGE_RANKING_QUERY_KEY_PREFIX,
    params.page ?? EMPTY_QUERY_PARAM_KEY,
    params.size ?? EMPTY_QUERY_PARAM_KEY,
  ] as const

const getLatestChallengeRankingOrThrow = async (
  params: GetLatestChallengeRankingParams,
): Promise<LatestChallengeRankingData> => {
  const result = await getLatestChallengeRanking(params)

  if (!result.ok) {
    throw new Error(result.reason)
  }

  return result.data
}

export function useLatestChallengeRanking(
  options: UseLatestChallengeRankingOptions = {},
): UseQueryResult<LatestChallengeRankingData, Error> {
  const requestParams: GetLatestChallengeRankingParams = {
    ...(options.page !== undefined ? { page: options.page } : {}),
    ...(options.size !== undefined ? { size: options.size } : {}),
  }

  return useQuery<LatestChallengeRankingData, Error>({
    queryKey: buildLatestChallengeRankingQueryKey(requestParams),
    queryFn: () => getLatestChallengeRankingOrThrow(requestParams),
    enabled: options.enabled,
    retry: false,
    staleTime: LATEST_CHALLENGE_RANKING_STALE_TIME_MS,
    gcTime: LATEST_CHALLENGE_RANKING_GC_TIME_MS,
  })
}
