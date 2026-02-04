import { httpClient } from '@/shared'

type CompleteAudioUploadResponse = {
  data?: {
    attemptId?: number
    status?: string
  }
}

type CompleteAudioUploadResult =
  | { ok: true; data: CompleteAudioUploadResponse['data'] }
  | { ok: false; reason: string }

export async function completeAudioUpload(
  accessToken: string,
  cardId: number,
  attemptId: number,
  audioUrl: string,
  durationSeconds: number,
): Promise<CompleteAudioUploadResult> {
  try {
    const response = await httpClient.put<CompleteAudioUploadResponse>(
      `/cards/${cardId}/attempts/${attemptId}/upload-complete`,
      { audioUrl, durationSeconds },
      {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        },
      },
    )

    return { ok: true, data: response.data?.data }
  } catch (error) {
    console.error('Failed to complete audio upload', error)
    return { ok: false, reason: 'request_failed' }
  }
}
