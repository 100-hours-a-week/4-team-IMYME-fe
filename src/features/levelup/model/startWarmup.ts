import { httpClient } from '@/shared'

type StartWarmupPayload = {
  cardId: number
}

type StartWarmupResponse = {
  data?: {
    attemptId: number
  }
}

export async function startWarmup(accessToken: string, payload: StartWarmupPayload) {
  try {
    const response = await httpClient.post<StartWarmupResponse>('/learning/warmup', payload, {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
    })

    return response.data
  } catch (error) {
    console.error('Failed to start warmup', error)
    return null
  }
}
