'use client'

import { Button } from '@/shared/ui/button'

export function LoginButton() {
  const handleKakaoLoginClick = async () => {
    window.location.href = '/api/auth/kakao'
  }

  return (
    <Button
      onClick={handleKakaoLoginClick}
      size={'lg'}
      variant={'login'}
    >
      카카오로 시작하기
    </Button>
  )
}
