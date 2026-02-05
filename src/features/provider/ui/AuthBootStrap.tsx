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

      const handleRefreshFailure = (reason: string, details?: Record<string, unknown>) => {
        console.error('[auth-refresh] failed', { reason, ...details })
        clearAccessToken()
        router.replace('/login')
      }

      try {
        const res = await fetch(buildServerUrl(REFRESH_PATH), { method: 'POST' })
        if (!res.ok) {
          handleRefreshFailure('response_not_ok', { status: res.status })
          return
        }

        const data = (await res.json()) as { access_token?: string }
        if (!data.access_token) {
          handleRefreshFailure('missing_access_token')
          return
        }
        setAccessToken(data.access_token)
      } catch {
        handleRefreshFailure('request_failed')
      }
    }

    void run()
  }, [accessToken, clearAccessToken, router, setAccessToken])

  return null
}
