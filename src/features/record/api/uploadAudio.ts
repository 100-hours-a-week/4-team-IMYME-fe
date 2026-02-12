type UploadAudioResult = { ok: true } | { ok: false; reason: string }

const ALLOWED_AUDIO_CONTENT_TYPES = ['audio/mp4', 'audio/webm', 'audio/wav', 'audio/mpeg'] as const
type AllowedAudioContentType = (typeof ALLOWED_AUDIO_CONTENT_TYPES)[number]

const isAllowedContentType = (contentType: string | null): contentType is AllowedAudioContentType =>
  Boolean(contentType) &&
  ALLOWED_AUDIO_CONTENT_TYPES.includes(contentType as AllowedAudioContentType)

const createInvalidContentTypeResult = (contentType: string | null): UploadAudioResult => {
  console.error('Unsupported audio content type', contentType)
  return { ok: false, reason: 'unsupported_content_type' }
}

export async function uploadAudio(
  uploadUrl: string,
  file: Blob,
  contentType: string | null,
): Promise<UploadAudioResult> {
  try {
    if (!isAllowedContentType(contentType)) {
      return createInvalidContentTypeResult(contentType)
    }

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file,
    })

    if (!response.ok) {
      return { ok: false, reason: 'upload_failed' }
    }

    return { ok: true }
  } catch (error) {
    console.error('Failed to upload audio', error)
    return { ok: false, reason: 'request_failed' }
  }
}
