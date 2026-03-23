import axios from 'axios'

import { proxyApiClient } from '@/shared/api'

export type CompleteChallengeAttemptUploadRequestBody = {
  objectKey: string
  durationSeconds: number
}

export type CompleteChallengeAttemptUploadData = {
  attemptId: number
  status: string
  durationSeconds: number
  message: string
}

type CompleteChallengeAttemptUploadResponse = {
  success?: boolean
  data?: CompleteChallengeAttemptUploadData
  message?: string
  timestamp?: string
}

type ChallengeAttemptUploadCompleteErrorResponse = {
  error?: string
  message?: string
  details?: string
  timestamp?: string
  path?: string
}

type CompleteChallengeAttemptUploadSuccessResult = {
  ok: true
  data: CompleteChallengeAttemptUploadData
}

type CompleteChallengeAttemptUploadFailureResult = {
  ok: false
  reason: string
  statusCode?: number
  errorCode?: string
  message?: string
  details?: string
}

export type CompleteChallengeAttemptUploadResult =
  | CompleteChallengeAttemptUploadSuccessResult
  | CompleteChallengeAttemptUploadFailureResult

const CHALLENGE_PROXY_PATH_PREFIX = '/proxy-api/challenges'
const EMPTY_DATA_REASON = 'empty_data'
const REQUEST_FAILED_REASON = 'request_failed'

const HTTP_BAD_REQUEST_STATUS = 400
const HTTP_UNAUTHORIZED_STATUS = 401
const HTTP_NOT_FOUND_STATUS = 404
const HTTP_CONFLICT_STATUS = 409
const HTTP_GONE_STATUS = 410

const REQUEST_FAILED_BY_STATUS_REASON_MAP: Record<number, string> = {
  [HTTP_BAD_REQUEST_STATUS]: 'bad_request',
  [HTTP_UNAUTHORIZED_STATUS]: 'unauthorized',
  [HTTP_NOT_FOUND_STATUS]: 'not_found',
  [HTTP_CONFLICT_STATUS]: 'conflict',
  [HTTP_GONE_STATUS]: 'gone',
}

const buildCompleteChallengeAttemptUploadPath = (challengeId: number, attemptId: number) =>
  `${CHALLENGE_PROXY_PATH_PREFIX}/${challengeId}/attempts/${attemptId}/upload-complete`

export async function completeChallengeAttemptUpload(
  challengeId: number,
  attemptId: number,
  requestBody: CompleteChallengeAttemptUploadRequestBody,
): Promise<CompleteChallengeAttemptUploadResult> {
  try {
    const response = await proxyApiClient.post<CompleteChallengeAttemptUploadResponse>(
      buildCompleteChallengeAttemptUploadPath(challengeId, attemptId),
      requestBody,
    )
    const completeData = response.data?.data

    if (!completeData) {
      return { ok: false, reason: EMPTY_DATA_REASON }
    }

    return { ok: true, data: completeData }
  } catch (error) {
    if (axios.isAxiosError<ChallengeAttemptUploadCompleteErrorResponse>(error)) {
      const statusCode = error.response?.status
      const errorPayload = error.response?.data
      const errorCode = errorPayload?.error
      const reason = statusCode
        ? (REQUEST_FAILED_BY_STATUS_REASON_MAP[statusCode] ?? REQUEST_FAILED_REASON)
        : REQUEST_FAILED_REASON

      return {
        ok: false,
        reason,
        statusCode,
        errorCode,
        message: errorPayload?.message,
        details: errorPayload?.details,
      }
    }

    console.error('Failed to complete challenge attempt upload', error)
    return { ok: false, reason: REQUEST_FAILED_REASON }
  }
}
