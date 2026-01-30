'use client'

type StartMediaRecorderOptions = {
  mimeType?: string
  audioBitsPerSecond?: number
  timesliceMs?: number
  constraints?: MediaStreamConstraints
}

type StartMediaRecorderResult =
  | { ok: true; recorder: MediaRecorder; stream: MediaStream }
  | { ok: false; reason: string }

const DEFAULT_CONSTRAINTS: MediaStreamConstraints = { audio: true }
const ALLOWED_MIME_TYPES = ['audio/mp4', 'audio/webm']
const DEFAULT_MIME_TYPE = 'audio/webm'

export async function startMediaRecorder(
  options: StartMediaRecorderOptions = {},
): Promise<StartMediaRecorderResult> {
  if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return { ok: false, reason: 'media_devices_unavailable' }
  }

  if (options.mimeType && !ALLOWED_MIME_TYPES.includes(options.mimeType)) {
    return { ok: false, reason: 'unsupported_mime_type' }
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia(
      options.constraints ?? DEFAULT_CONSTRAINTS,
    )
    const preferredMimeType = options.mimeType ?? DEFAULT_MIME_TYPE
    const mimeType = MediaRecorder.isTypeSupported(preferredMimeType)
      ? preferredMimeType
      : ALLOWED_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type))

    if (!mimeType) {
      return { ok: false, reason: 'unsupported_mime_type' }
    }

    const recorder = new MediaRecorder(stream, {
      mimeType,
      audioBitsPerSecond: options.audioBitsPerSecond,
    })

    if (options.timesliceMs) {
      recorder.start(options.timesliceMs)
    } else {
      recorder.start()
    }

    return { ok: true, recorder, stream }
  } catch (error) {
    console.error('Failed to start media recorder', error)
    return { ok: false, reason: 'start_failed' }
  }
}
