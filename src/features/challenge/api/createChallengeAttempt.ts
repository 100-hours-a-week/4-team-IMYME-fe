import { proxyApiClient } from '@/shared/api'
import { resolveAudioContentType } from '@/shared/lib/audioContentType'

export type ChallengeAttemptData = {
  attemptId: number
  challengeId: number
  uploadUrl: string
  objectKey: string
  expiresIn: number
  status: string
}

type CreateChallengeAttemptRequestBody = {
  contentType: string
}

type CreateChallengeAttemptResponse = {
  success?: boolean
  data?: ChallengeAttemptData
  message?: string
  timestamp?: string
}

type CreateChallengeAttemptResult =
  | { ok: true; data: ChallengeAttemptData }
  | { ok: false; reason: string }

const CHALLENGE_ATTEMPTS_PROXY_PATH_PREFIX = '/proxy-api/challenges'
const DEFAULT_CHALLENGE_AUDIO_CONTENT_TYPE = 'audio/webm'
const EMPTY_DATA_REASON = 'empty_data'
const REQUEST_FAILED_REASON = 'request_failed'

const buildChallengeAttemptsProxyPath = (challengeId: number) =>
  `${CHALLENGE_ATTEMPTS_PROXY_PATH_PREFIX}/${challengeId}/attempts`

export async function createChallengeAttempt(
  challengeId: number,
  contentType = DEFAULT_CHALLENGE_AUDIO_CONTENT_TYPE,
): Promise<CreateChallengeAttemptResult> {
  const requestBody: CreateChallengeAttemptRequestBody = {
    contentType: resolveAudioContentType(contentType),
  }

  try {
    const response = await proxyApiClient.post<CreateChallengeAttemptResponse>(
      buildChallengeAttemptsProxyPath(challengeId),
      requestBody,
    )
    const attemptData = response.data?.data

    if (!attemptData) {
      return { ok: false, reason: EMPTY_DATA_REASON }
    }

    return { ok: true, data: attemptData }
  } catch (error) {
    console.error('Failed to create challenge attempt', error)
    return { ok: false, reason: REQUEST_FAILED_REASON }
  }
}
