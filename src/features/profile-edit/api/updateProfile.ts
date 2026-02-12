import { httpClient } from '@/shared'

type UpdateProfilePayload = {
  nickname: string | null
  profileImageKey: string | null
}

type UpdateProfileResponse = {
  data?: {
    nickname?: string
    profileImageUrl?: string
    profileImageKey?: string
    id?: number
    level?: number
    activeCardCount?: number
    consecutiveDays?: number
    winCount?: number
  }
}

type UpdateProfileResult =
  | { ok: true; data: UpdateProfileResponse['data'] }
  | { ok: false; reason: string }

export async function updateProfile(
  accessToken: string,
  payload: UpdateProfilePayload,
): Promise<UpdateProfileResult> {
  try {
    const response = await httpClient.patch<UpdateProfileResponse>('/users/me', payload, {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
    })

    return { ok: true, data: response.data?.data }
  } catch (error) {
    console.error('Failed to update profile', error)
    return { ok: false, reason: 'request_failed' }
  }
}
