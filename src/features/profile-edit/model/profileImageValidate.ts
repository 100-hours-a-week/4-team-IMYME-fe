type ImageValidationResult =
  | { ok: true }
  | { ok: false; reason: 'unsupported-type' | 'file-too-large' }

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/webp']
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

export function validateProfileImage(file: File): ImageValidationResult {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { ok: false, reason: 'unsupported-type' }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { ok: false, reason: 'file-too-large' }
  }

  return { ok: true }
}
