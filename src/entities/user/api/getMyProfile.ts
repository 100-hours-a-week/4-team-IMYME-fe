import { httpClient } from '@/shared'

import type { UserProfile } from '../model/userProfile'

type GetMyProfileResponse = {
  data?: UserProfile
}

type GetMyProfileResult = { ok: true; data: UserProfile } | { ok: false; reason: string }

export async function getMyProfile(accessToken: string): Promise<GetMyProfileResult> {
  try {
    const response = await httpClient.get<GetMyProfileResponse>('/users/me', {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
    })

    const profile = response.data?.data
    if (!profile) {
      return { ok: false, reason: 'empty_profile' }
    }

    return { ok: true, data: profile }
  } catch (error) {
    console.error('Failed to fetch profile', error)
    return { ok: false, reason: 'request_failed' }
  }
}
