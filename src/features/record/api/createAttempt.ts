import { httpClient } from '@/shared'

type CreateAttemptResponse = {
  data?: {
    cardId?: number
    attemptId?: number
    attemptNo?: number
    status?: string
    createdAt?: string
    expiresAt?: string
    message?: string
  }
}

type CreateAttemptResult =
  | { ok: true; data: CreateAttemptResponse['data'] }
  | { ok: false; reason: string }

export async function createAttempt(
  accessToken: string,
  cardId: number,
  durationSeconds: number,
): Promise<CreateAttemptResult> {
  try {
    const response = await httpClient.post<CreateAttemptResponse>(
      `/cards/${cardId}/attempts`,
      { durationSeconds },
      {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        },
      },
    )

    return { ok: true, data: response.data?.data }
  } catch (error) {
    console.error('Failed to create attempt', error)
    return { ok: false, reason: 'request_failed' }
  }
}
