import { proxyApiClient } from '@/shared/api'

export type ChallengeFeedback = {
  facts?: string
  summary?: string
  keywords?: string[]
  understanding?: string
  personalized_feedback?: string
}

export type MyChallengeResultSummary = {
  attemptId: number
  score: number
  rank: number
  percentile: number
  durationSeconds: number
  sttText: string
  feedback?: ChallengeFeedback | null
}

export type MyChallengeResultData = {
  challengeId: number
  keywordName: string
  challengeDate: string
  status: string
  myResult?: MyChallengeResultSummary | null
}

type GetMyChallengeResultResponse = {
  success?: boolean
  data?: MyChallengeResultData
  timestamp?: string
}

export type GetMyChallengeResultResult =
  | { ok: true; data: MyChallengeResultData }
  | { ok: false; reason: string }

const CHALLENGES_PROXY_PATH_PREFIX = '/proxy-api/challenges'
const EMPTY_DATA_REASON = 'empty_data'
const REQUEST_FAILED_REASON = 'request_failed'

const buildMyChallengeResultProxyPath = (challengeId: number) =>
  `${CHALLENGES_PROXY_PATH_PREFIX}/${challengeId}/my-result`

export async function getMyChallengeResult(
  challengeId: number,
): Promise<GetMyChallengeResultResult> {
  try {
    const response = await proxyApiClient.get<GetMyChallengeResultResponse>(
      buildMyChallengeResultProxyPath(challengeId),
    )
    const myChallengeResultData = response.data?.data

    if (!myChallengeResultData) {
      return { ok: false, reason: EMPTY_DATA_REASON }
    }

    return { ok: true, data: myChallengeResultData }
  } catch (error) {
    console.error('Failed to fetch my challenge result', error)
    return { ok: false, reason: REQUEST_FAILED_REASON }
  }
}
