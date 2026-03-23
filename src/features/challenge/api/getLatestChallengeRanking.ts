import { proxyApiClient } from '@/shared/api'

export type GetLatestChallengeRankingParams = {
  page?: number
  size?: number
}

export type LatestChallengeSummary = {
  id: number
  keywordName: string
  challengeDate: string
  status: string
  participantCount: number
}

export type LatestChallengeRankingItem = {
  rank: number
  userId: number
  nickname: string
  profileImageUrl: string
  score: number
  isMe: boolean
}

export type LatestChallengeRankingPagination = {
  currentPage: number
  totalPages: number
  totalCount: number
  size: number
  hasNext: boolean
  hasPrevious: boolean
}

export type LatestChallengeMyRank = {
  rank: number
  score: number
  percentile: number
}

export type LatestChallengeRankingData = {
  challenge: LatestChallengeSummary
  rankings: LatestChallengeRankingItem[]
  pagination: LatestChallengeRankingPagination
  myRank?: LatestChallengeMyRank | null
}

type GetLatestChallengeRankingResponse = {
  success?: boolean
  data?: LatestChallengeRankingData
  message?: string
  timestamp?: string
}

export type GetLatestChallengeRankingResult =
  | { ok: true; data: LatestChallengeRankingData }
  | { ok: false; reason: string }

const LATEST_CHALLENGE_RANKING_PROXY_PATH = '/proxy-api/challenges/latest-rankings'
const EMPTY_DATA_REASON = 'empty_data'
const REQUEST_FAILED_REASON = 'request_failed'

export async function getLatestChallengeRanking(
  params: GetLatestChallengeRankingParams = {},
): Promise<GetLatestChallengeRankingResult> {
  try {
    const response = await proxyApiClient.get<GetLatestChallengeRankingResponse>(
      LATEST_CHALLENGE_RANKING_PROXY_PATH,
      {
        params: {
          ...(params.page !== undefined ? { Page: params.page } : {}),
          ...(params.size !== undefined ? { size: params.size } : {}),
        },
      },
    )

    const rankingData = response.data?.data
    if (!rankingData) {
      return { ok: false, reason: EMPTY_DATA_REASON }
    }

    return { ok: true, data: rankingData }
  } catch (error) {
    console.error('Failed to fetch latest challenge ranking', error)
    return { ok: false, reason: REQUEST_FAILED_REASON }
  }
}
