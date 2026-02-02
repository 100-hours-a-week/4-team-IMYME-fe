import { httpClient } from '@/shared'

type GetAudioUrlResponse = {
  data: {
    attemptId: number
    uploadUrl: string
    objectKey: string
    expiresAt: string
  }
}

type GetAudioUrlResult =
  | { ok: true; data: GetAudioUrlResponse['data'] }
  | { ok: false; reason: string }

export async function getAudioUrl(
  accessToken: string,
  cardId: number,
  attemptId: number,
  fileExtension: string,
): Promise<GetAudioUrlResult> {
  try {
    const response = await httpClient.post<GetAudioUrlResponse>(
      '/learning/presigned-url',
      { cardId, attemptId, fileExtension },
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
