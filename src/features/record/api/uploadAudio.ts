type UploadAudioResult = { ok: true } | { ok: false; reason: string }

const AUDIO_CONTENT_TYPE_MAP: Record<string, string> = {
  webm: 'audio/webm',
  mp4: 'audio/mp4',
  wav: 'audio/wav',
  mp3: 'audio/mpeg',
}

const getAudioContentType = (fileExtension: string | null, fallbackType: string) => {
  if (fileExtension) {
    return AUDIO_CONTENT_TYPE_MAP[fileExtension] ?? `audio/${fileExtension}`
  }
  return fallbackType || 'application/octet-stream'
}

export async function uploadAudio(
  uploadUrl: string,
  file: Blob,
  fileExtension: string | null,
): Promise<UploadAudioResult> {
  try {
    const contentType = getAudioContentType(fileExtension, file.type)
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
