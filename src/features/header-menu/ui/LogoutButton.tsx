'use client'

import { useClearProfile } from '@/entities/user/model/useUserStore'
import { useAccessToken, useClearAccesstoken } from '@/features/auth/model/client/useAuthStore'
import { httpClient } from '@/shared'
import { Button } from '@/shared/ui/button'

export function LogoutButton() {
  const accessToken = useAccessToken()
  const clearAccessToken = useClearAccesstoken()
  const clearProfile = useClearProfile()

  const handleLogout = async () => {
    const deviceUuid = localStorage.getItem('device_uuid')

    try {
      const response = await httpClient.post(
        '/auth/logout',
        {
          deviceUuid,
        },
        {
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
          },
        },
      )
      console.log(response)
      if (response.status === 204) {
        try {
          await fetch('/api/auth/token/refresh/clear', { method: 'POST' })
        } catch (error) {
          console.error('Failed to clear refresh token cookie', error)
        }

        clearAccessToken()
        clearProfile()
      }
    } catch (error) {
      console.error('[logout] request failed', error)
    }
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
