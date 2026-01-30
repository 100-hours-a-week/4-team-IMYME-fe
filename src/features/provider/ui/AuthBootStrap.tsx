'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import {
  useClearAccesstoken,
  useSetAccessToken,
  useAccessToken,
} from '@/features/auth/model/client/useAuthStore'

const REFRESH_PATH = '/api/auth/refresh'
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
const DEVICE_UUID_STORAGE_KEY = 'device_uuid'

const buildServerUrl = (path: string) => {
  const normalizedBase = SERVER_URL.replace(/\/$/, '')
  return `${normalizedBase}${path}`
}

export function AuthBootstrap() {
  const accessToken = useAccessToken()
  const setAccessToken = useSetAccessToken()
  const clearAccessToken = useClearAccesstoken()
  const router = useRouter()

  useEffect(() => {
    const run = async () => {
      if (accessToken) return

      const handleRefreshFailure = () => {
        clearAccessToken()
        window.localStorage.removeItem(DEVICE_UUID_STORAGE_KEY)
        router.replace('/login')
      }

      try {
        const res = await fetch(buildServerUrl(REFRESH_PATH), { method: 'POST' })
        if (!res.ok) {
          handleRefreshFailure()
          return
        }

        const data = (await res.json()) as { access_token?: string }
        if (!data.access_token) {
          handleRefreshFailure()
          return
        }
        setAccessToken(data.access_token)
      } catch {
        handleRefreshFailure()
      }
    }

    void run()
  }, [accessToken, clearAccessToken, router, setAccessToken])

  return null
}
