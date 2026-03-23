import { isSupportedAudioContentType } from '@/shared/lib/audioContentType'

type UploadChallengeAttemptAudioResult = { ok: true } | { ok: false; reason: string }

const UNSUPPORTED_CONTENT_TYPE_REASON = 'unsupported_content_type'
const UPLOAD_FAILED_REASON = 'upload_failed'
const REQUEST_FAILED_REASON = 'request_failed'

export async function uploadChallengeAttemptAudio(
  uploadUrl: string,
  file: Blob,
  contentType: string | null,
): Promise<UploadChallengeAttemptAudioResult> {
  try {
    if (!isSupportedAudioContentType(contentType)) {
      console.error('Unsupported challenge audio content type', contentType)
      return { ok: false, reason: UNSUPPORTED_CONTENT_TYPE_REASON }
    }

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file,
    })

    if (!response.ok) {
      return { ok: false, reason: UPLOAD_FAILED_REASON }
    }

    return { ok: true }
  } catch (error) {
    console.error('Failed to upload challenge attempt audio', error)
    return { ok: false, reason: REQUEST_FAILED_REASON }
  }
}
