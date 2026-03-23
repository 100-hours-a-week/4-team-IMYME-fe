'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/shared/ui/button'

export function HelpButton() {
  const router = useRouter()

  const handleHelp = () => {
    router.push('/help')
  }
  return (
    <Button
      variant={'modal_btn_primary'}
      onClick={handleHelp}
    >
      도움말
    </Button>
  )
}
