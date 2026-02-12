import { httpClient } from '@/shared'

type GetAudioUrlResponse = {
  data: {
    attemptId: number
    uploadUrl: string
    objectKey: string
    contentType: string
    expiresAt: string
  }
}

type GetAudioUrlResult =
  | { ok: true; data: GetAudioUrlResponse['data'] }
  | { ok: false; reason: string }

const ALLOWED_AUDIO_CONTENT_TYPES = ['audio/mp4', 'audio/webm', 'audio/wav', 'audio/mpeg'] as const
type AllowedAudioContentType = (typeof ALLOWED_AUDIO_CONTENT_TYPES)[number]

const isAllowedContentType = (contentType: string): contentType is AllowedAudioContentType =>
  ALLOWED_AUDIO_CONTENT_TYPES.includes(contentType as AllowedAudioContentType)

export async function getAudioUrl(
  accessToken: string,
  attemptId: number,
  contentType: string,
): Promise<GetAudioUrlResult> {
  try {
    if (!isAllowedContentType(contentType)) {
      console.error('Unsupported audio content type', contentType)
      return { ok: false, reason: 'unsupported_content_type' }
    }

    const response = await httpClient.post<GetAudioUrlResponse>(
      '/learning/presigned-url',
      { attemptId, contentType },
      {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        },
      },
    )

    return { ok: true, data: response.data?.data }
  } catch (error) {
    console.error('Failed to get audio URL', error)
    return { ok: false, reason: 'request_failed' }
  }
}
