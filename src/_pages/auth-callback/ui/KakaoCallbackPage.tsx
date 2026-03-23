'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { useSetAccessToken } from '@/features/auth'
import { createUuidForRegex } from '@/shared'

const DEVICE_UUID_STORAGE_KEY = 'device_uuid'
const KAKAO_CODE_QUERY_KEY = 'code'
const DEFAULT_REDIRECT_PATH = '/main'
const REFRESH_TOKEN_CLEAR_PATH = '/api/auth/token/refresh/clear'
const KAKAO_EXCHANGE_PATH = '/api/auth/kakao/exchange'
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
const DEBUG_AUTH_CALLBACK_STORAGE_KEY = 'debug_auth_callback_logs'
const SHOULD_LOG_AUTH_CALLBACK_BY_ENV =
  process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG_AUTH_CALLBACK === 'true'

const buildServerUrl = (path: string) => {
  const normalizedBase = SERVER_URL.replace(/\/$/, '')
  return `${normalizedBase}${path}`
}

const logAuthCallback = (message: string, payload?: Record<string, unknown>) => {
  const shouldLogByStorage =
    typeof window !== 'undefined' &&
    window.localStorage.getItem(DEBUG_AUTH_CALLBACK_STORAGE_KEY) === 'true'
  const shouldLog = SHOULD_LOG_AUTH_CALLBACK_BY_ENV || shouldLogByStorage

  if (!shouldLog) {
    return
  }

  if (payload) {
    console.info(`[auth-callback] ${message}`, payload)
    return
  }

  console.info(`[auth-callback] ${message}`)
}

export function KakaoCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get(KAKAO_CODE_QUERY_KEY)
  const setAccessToken = useSetAccessToken()
  useEffect(() => {
    const run = async () => {
      if (!code) {
        logAuthCallback('missing kakao code. clear refresh token and redirect to /login')
        try {
          await fetch(buildServerUrl(REFRESH_TOKEN_CLEAR_PATH), { method: 'POST' })
        } catch {}
        router.replace('/login')
        return
      }

      // ✅ 1) device_uuid 로컬에 보장
      let deviceUuid = localStorage.getItem(DEVICE_UUID_STORAGE_KEY)
      if (!deviceUuid) {
        deviceUuid = createUuidForRegex()
        if (deviceUuid) localStorage.setItem(DEVICE_UUID_STORAGE_KEY, deviceUuid)
      }
      if (!deviceUuid) {
        logAuthCallback('device_uuid unavailable. redirect to /login')
        router.replace('/login')
        return
      }

      const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI ?? ''

      // ✅ 2) 동일 출처 API로 교환 (URL에 토큰 싣지 않음)
      const res = await fetch(buildServerUrl(KAKAO_EXCHANGE_PATH), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, deviceUuid, redirectUri }),
      })

      if (!res.ok) {
        logAuthCallback('kakao exchange failed', { status: res.status })
        router.replace('/login')
        return
      }

      const data = (await res.json()) as {
        accessToken: string
        expiresIn?: number
        deviceUuid: string
      }

      // ✅ 3) access token + expiresIn → zustand (AuthBootstrap 선제 갱신 스케줄링용)
      setAccessToken(data.accessToken, data.expiresIn)
      logAuthCallback('kakao exchange success')
      logAuthCallback('redirect to /main')
      router.replace(DEFAULT_REDIRECT_PATH)
    }

    void run()
  }, [router, code, setAccessToken])

  return null
}
