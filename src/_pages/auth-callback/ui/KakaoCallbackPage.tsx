'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { useAuthStore } from '@/features/auth'

const DEVICE_UUID_STORAGE_KEY = 'device_uuid'
const KAKAO_CODE_QUERY_KEY = 'code'
const DEFAULT_REDIRECT_PATH = '/main'
const REFRESH_TOKEN_CLEAR_ENDPOINT = '/api/auth/token/refresh/clear'

export const createUuidForRegex = (): string => {
  // 가장 간단하고 표준(UUID v4)
  if (typeof crypto?.randomUUID === 'function') {
    // 일부 환경에서 대문자가 나올 가능성까지 막기 위해 소문자 처리
    return crypto.randomUUID().toLowerCase()
  }

  // fallback: 16 bytes -> RFC4122 v4 형태로 포맷
  if (typeof crypto?.getRandomValues === 'function') {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)

    // RFC4122 version(4) & variant(10xx) 설정
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80

    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  // crypto가 없으면 생성 불가(원하면 다른 난수로 fallback 가능)
  return ''
}

export function KakaoCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAccessToken = useAuthStore((s) => s.setAccessToken)

  useEffect(() => {
    const run = async () => {
      const code = searchParams.get(KAKAO_CODE_QUERY_KEY)

      if (!code) {
        try {
          await fetch(REFRESH_TOKEN_CLEAR_ENDPOINT, { method: 'POST' })
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
      const res = await fetch('/api/auth/kakao/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, device_uuid: deviceUuid }),
      })

      if (!res.ok) {
        router.replace('/login')
        return
      }

      const data = (await res.json()) as { access_token: string; device_uuid: string }

      // ✅ 3) access token → zustand
      setAccessToken(data.access_token)

      router.replace(DEFAULT_REDIRECT_PATH)
    }

    void run()
  }, [router, searchParams, setAccessToken])

  return null
}
