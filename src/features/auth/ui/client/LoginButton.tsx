'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/shared/ui/button'

export function LoginButton() {
  const router = useRouter()

  const handleKakaoLoginClick = () => {
    router.push('/main')
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
