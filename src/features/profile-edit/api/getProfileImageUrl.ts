import { httpClient } from '@/shared'

type PresignedUrlResponse = {
  data?: {
    uploadUrl?: string
    profileImageUrl?: string
    profileImageKey?: string
  }
}

type PresignedUrlResult =
  | { ok: true; uploadUrl: string; profileImageKey: string }
  | { ok: false; reason: string }

export async function getProfileImageUrl(
  accessToken: string,
  contentType: string,
): Promise<PresignedUrlResult> {
  try {
    const response = await httpClient.post<PresignedUrlResponse>(
      '/users/me/profile-image/presigned-url',
      { contentType },
      {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        },
      },
    )

    const uploadUrl = response.data?.data?.uploadUrl
    const profileImageKey = response.data?.data?.profileImageKey

    if (!uploadUrl || !profileImageKey) {
      return { ok: false, reason: 'invalid_response' }
    }

    return { ok: true, uploadUrl, profileImageKey }
  } catch (error) {
    console.error('Failed to get profile image URL', error)
    return { ok: false, reason: 'request_failed' }
  }
}
