'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { type UserProfile } from '@/entities/user'
import { useSetAccessToken } from '@/features/auth'
import { createUuidForRegex } from '@/shared'

const DEVICE_UUID_STORAGE_KEY = 'device_uuid'
const KAKAO_CODE_QUERY_KEY = 'code'
const DEFAULT_REDIRECT_PATH = '/main'
const REFRESH_TOKEN_CLEAR_PATH = '/api/auth/token/refresh/clear'
const KAKAO_EXCHANGE_PATH = '/api/auth/kakao/exchange'
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

const buildServerUrl = (path: string) => {
  const normalizedBase = SERVER_URL.replace(/\/$/, '')
  return `${normalizedBase}${path}`
}

export function KakaoCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get(KAKAO_CODE_QUERY_KEY)
  const setAccessToken = useSetAccessToken()
  useEffect(() => {
    const run = async () => {
      if (!code) {
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
        router.replace('/login')
        return
      }

      // ✅ 2) 동일 출처 API로 교환 (URL에 토큰 싣지 않음)
      const res = await fetch(buildServerUrl(KAKAO_EXCHANGE_PATH), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, deviceUuid }),
      })

      if (!res.ok) {
        router.replace('/login')
        return
      }

      const data = (await res.json()) as {
        accessToken: string
        deviceUuid: string
        user: UserProfile
      }

      // ✅ 3) access token → zustand
      setAccessToken(data.accessToken)

      router.replace(DEFAULT_REDIRECT_PATH)
    }

    void run()
  }, [router, code, setAccessToken])

  return null
}
