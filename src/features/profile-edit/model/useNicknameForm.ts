import { type ChangeEvent, type FocusEvent, useState } from 'react'

import { validateNickname } from '@/features/profile-edit'

const ERROR_MESSAGES: Record<'too-short' | 'too-long', string> = {
  'too-short': '닉네임은 2자 이상 입력해주세요.',
  'too-long': '닉네임은 10자 이하로 입력해주세요.',
}

export function useNicknameForm() {
  const [nickname, setNickname] = useState('')
  const [hasNicknameError, setHasNicknameError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleNicknameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    setNickname(nextValue)
    if (!nextValue) {
      setHasNicknameError(false)
    }
  }

  const handleNicknameBlur = (_event: FocusEvent<HTMLInputElement>) => {
    const trimmed = nickname.trim()

    if (trimmed.length === 0) {
      setHasNicknameError(false) // 빈값은 에러 표시 안 함(원하면 true로 바꿔도 됨)
      return
    }

    const validation = validateNickname(trimmed)
    if (!validation.ok) {
      setHasNicknameError(true)
      setErrorMessage(ERROR_MESSAGES[validation.reason])
      return
    }

    setHasNicknameError(false)
  }

  return {
    nickname,
    handleNicknameChange,
    handleNicknameBlur,
    hasNicknameError,
    errorMessage,
  }
}
