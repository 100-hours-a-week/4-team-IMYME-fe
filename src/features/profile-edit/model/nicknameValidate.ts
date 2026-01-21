type NicknameValidationResult =
  | { ok: true; reason: 'too-long' | null }
  | { ok: false; reason: 'too-short' | 'too-long' }

const MIN_NICKNAME_LENGTH = 2
const MAX_NICKNAME_LENGTH = 10

export function validateNickname(value: string): NicknameValidationResult {
  if (value.length < MIN_NICKNAME_LENGTH) {
    return { ok: false, reason: 'too-short' }
  }

  if (value.length > MAX_NICKNAME_LENGTH) {
    return { ok: false, reason: 'too-long' }
  }

  return { ok: true, reason: null }
}
