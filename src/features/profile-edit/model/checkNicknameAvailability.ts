import { httpClient } from '@/shared'

type NicknameCheckResponse = {
  message: string
  data: {
    available: boolean
    reason: string
  }
}

type NicknameCheckResult =
  | { ok: true; isAvailable: boolean; reason: string; message: string | null }
  | { ok: false; reason: string }

export async function checkNicknameAvailability(
  accessToken: string,
  nickname: string,
): Promise<NicknameCheckResult> {
  try {
    const response = await httpClient.get<NicknameCheckResponse>('/users/nickname/check', {
      params: { nickname },
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
    })

    console.log(response.data)
    return {
      ok: true,
      isAvailable: Boolean(response.data?.data?.available),
      reason: response.data?.data?.reason ?? '',
      message: response.data?.message ?? null,
    }
  } catch (error) {
    console.error('Failed to check nickname availability', error)
    return { ok: false, reason: 'request_failed' }
  }
}
