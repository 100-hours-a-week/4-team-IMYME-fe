import { type ChangeEvent, type FocusEvent, useState } from 'react'

import { useNickname } from '@/entities/user/model/useUserStore'
import { useAccessToken } from '@/features/auth/model/client/useAuthStore'
import { checkNicknameAvailability, validateNickname } from '@/features/profile-edit'

const ERROR_MESSAGES: Record<
  'too-short' | 'too-long' | 'DUPLICATE' | 'FORBIDDEN_WORD' | 'INVALID_FORMAT' | 'INVALID_LENGTH',
  string
> = {
  'too-short': '닉네임은 2자 이상 입력해주세요.',
  'too-long': '닉네임은 10자 이하로 입력해주세요.',
  DUPLICATE: '이미 사용 중인 닉네임입니다.',
  FORBIDDEN_WORD: '금지어를 포함 중입니다.',
  INVALID_FORMAT: '옳지 않은 형식입니다.',
  INVALID_LENGTH: '닉네임은 2자 이상, 10자 이하로 입력해주세요.',
}
const AVAILABILITY_ERROR_MESSAGES: Record<string, string> = {
  DUPLICATE: ERROR_MESSAGES.DUPLICATE,
  FORBIDDEN_WORD: ERROR_MESSAGES.FORBIDDEN_WORD,
  INVALID_FORMAT: ERROR_MESSAGES.INVALID_FORMAT,
  INVALID_LENGTH: ERROR_MESSAGES.INVALID_LENGTH,
}

const getAvailabilityErrorMessage = (reason: string | null) => {
  if (!reason) return null
  return AVAILABILITY_ERROR_MESSAGES[reason] ?? null
}

export function useNicknameForm() {
  const storeNickname = useNickname()
  const accessToken = useAccessToken()
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleNicknameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    setNickname(nextValue)
    if (!nextValue) {
      setError(false)
    }
  }

  const handleNicknameBlur = async (_event: FocusEvent<HTMLInputElement>) => {
    const trimmed = nickname.trim()

    if (trimmed.length === 0) {
      setError(false) // 빈값은 에러 표시 안 함(원하면 true로 바꿔도 됨)
      return
    }

    const availability = await checkNicknameAvailability(accessToken, trimmed)
    if (availability.ok) {
      if (!availability.isAvailable) {
        setError(true)
        setErrorMessage(getAvailabilityErrorMessage(availability.reason))
        return
      }
      setError(false)
      setErrorMessage(null)
    }

    const validation = validateNickname(trimmed)
    if (!validation.ok) {
      setError(true)
      setErrorMessage(ERROR_MESSAGES[validation.reason])
      return
    }
  }

  return {
    nickname,
    storeNickname,
    handleNicknameChange,
    handleNicknameBlur,
    error,
    errorMessage,
  }
}
