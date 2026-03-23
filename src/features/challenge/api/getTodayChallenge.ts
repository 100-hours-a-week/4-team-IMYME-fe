import { proxyApiClient } from '@/shared/api'

export type TodayChallengeKeyword = {
  id: number
  name: string
}

export type TodayChallengeMyParticipation = {
  attemptId?: number
  status?: string
  score?: number
  rank?: number
  percentile?: number
}

export type TodayChallengeData = {
  id: number
  keyword: TodayChallengeKeyword
  challengeDate: string
  startAt: string
  endAt: string
  status: string
  participantCount: number
  myParticipation?: TodayChallengeMyParticipation | null
  message: string
}

type GetTodayChallengeResponse = {
  success?: boolean
  data?: TodayChallengeData
  message?: string
  timestamp?: string
}

type GetTodayChallengeResult =
  | { ok: true; data: TodayChallengeData }
  | { ok: false; reason: string }

const TODAY_CHALLENGE_PROXY_PATH = '/proxy-api/challenges/today'
const EMPTY_DATA_REASON = 'empty_data'
const REQUEST_FAILED_REASON = 'request_failed'

export async function getTodayChallenge(): Promise<GetTodayChallengeResult> {
  try {
    const response = await proxyApiClient.get<GetTodayChallengeResponse>(TODAY_CHALLENGE_PROXY_PATH)
    const payload = response.data
    const todayChallenge = payload.data

    if (!todayChallenge) {
      return { ok: false, reason: EMPTY_DATA_REASON }
    }

    return {
      ok: true,
      data: todayChallenge,
    }
  } catch (error) {
    console.error('Failed to fetch today challenge', error)
    return { ok: false, reason: REQUEST_FAILED_REASON }
  }
}
