type UploadAudioResult = { ok: true } | { ok: false; reason: string }

export async function uploadAudio(uploadUrl: string, file: Blob): Promise<UploadAudioResult> {
  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
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
