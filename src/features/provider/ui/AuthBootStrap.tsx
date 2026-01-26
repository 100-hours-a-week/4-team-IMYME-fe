'use client'
import { useEffect } from 'react'

import { useSetAccessToken, useAccessToken } from '@/features/auth/model/client/useAuthStore'

const REFRESH_PATH = '/api/auth/refresh'
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

const buildServerUrl = (path: string) => {
  const normalizedBase = SERVER_URL.replace(/\/$/, '')
  return `${normalizedBase}${path}`
}

export function AuthBootstrap() {
  const accessToken = useAccessToken()
  const setAccessToken = useSetAccessToken()

  useEffect(() => {
    const run = async () => {
      if (accessToken) return

      const res = await fetch(buildServerUrl(REFRESH_PATH), { method: 'POST' })
      if (!res.ok) return

      const data = (await res.json()) as { access_token: string }
      setAccessToken(data.access_token)
    }

    void run()
  }, [accessToken, setAccessToken])

  return null
}
