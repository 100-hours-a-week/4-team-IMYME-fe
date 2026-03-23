'use client'

import { useRouter } from 'next/navigation'

import { useClearProfile } from '@/entities/user'
import { useClearAccesstoken } from '@/features/auth'
import { Button } from '@/shared/ui/button'

import { logout } from '../api/logout'

export function LogoutButton() {
  const clearAccessToken = useClearAccesstoken()
  const clearProfile = useClearProfile()
  const router = useRouter()
  const handleLogout = async () => {
    const deviceUuid = localStorage.getItem('device_uuid')

    const result = await logout(deviceUuid)
    if (!result.ok) {
      return
    }

    clearAccessToken()
    clearProfile()
    router.push('/main')
  }

  return (
    <Button
      variant={'modal_btn_primary'}
      onClick={handleLogout}
    >
      로그아웃
    </Button>
  )
}
