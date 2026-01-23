'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { useAuthStore } from '@/features/auth'

const DEVICE_UUID_STORAGE_KEY = 'device_uuid'
const ACCESS_TOKEN_QUERY_KEY = 'access_token'
const DEVICE_ID_QUERY_KEY = 'device_id'
const KAKAO_CODE_QUERY_KEY = 'code'
const DEFAULT_REDIRECT_PATH = '/main'
const REFRESH_TOKEN_CLEAR_ENDPOINT = '/api/auth/token/refresh'

export function KakaoCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAccessToken = useAuthStore((state) => state.setAccessToken)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get(KAKAO_CODE_QUERY_KEY)
      const deviceId = searchParams.get(DEVICE_ID_QUERY_KEY)
      const accessToken = searchParams.get(ACCESS_TOKEN_QUERY_KEY)

      if (!code) {
        try {
          await fetch(REFRESH_TOKEN_CLEAR_ENDPOINT, { method: 'POST' })
        } catch (error) {
          console.error('Failed to clear refresh token cookie', error)
        }

        router.replace('/login')
        return
      }

      if (accessToken) {
        setAccessToken(accessToken)
      }

      if (deviceId) {
        localStorage.setItem(DEVICE_UUID_STORAGE_KEY, deviceId)
      }

      router.replace(DEFAULT_REDIRECT_PATH)
    }

    void handleCallback()
  }, [router, searchParams, setAccessToken])

  return null
}
