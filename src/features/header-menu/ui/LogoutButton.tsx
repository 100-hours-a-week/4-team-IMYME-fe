'use client'

import { useRouter } from 'next/navigation'

import { useClearProfile } from '@/entities/user/model/useUserStore'
import { useAccessToken, useClearAccesstoken } from '@/features/auth/model/client/useAuthStore'
import { logout } from '@/features/header-menu/api/logout'
import { Button } from '@/shared/ui/button'

export function LogoutButton() {
  const accessToken = useAccessToken()
  const clearAccessToken = useClearAccesstoken()
  const clearProfile = useClearProfile()
  const router = useRouter()
  const handleLogout = async () => {
    const deviceUuid = localStorage.getItem('device_uuid')

    const result = await logout(accessToken, deviceUuid)
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
