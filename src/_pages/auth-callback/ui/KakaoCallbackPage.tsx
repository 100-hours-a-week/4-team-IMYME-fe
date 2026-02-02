'use client'

import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'
import { NextResponse } from 'next/server'
import { useEffect } from 'react'

import { useSetProfile } from '@/entities/user/model/useUserStore'
import { useSetAccessToken } from '@/features/auth/model/client/useAuthStore'
import { httpClient } from '@/shared'

import type { UserProfile } from '@/entities/user'

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

export const createUuidForRegex = (): string => {
  if (typeof crypto?.randomUUID === 'function') {
    return crypto.randomUUID().toLowerCase()
  }

  if (typeof crypto?.getRandomValues === 'function') {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)

    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80

    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  return ''
}

export function KakaoCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setAccessToken = useSetAccessToken()
  const setProfile = useSetProfile()

  useEffect(() => {
    const run = async () => {
      const code = searchParams.get(KAKAO_CODE_QUERY_KEY)

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

      try {
        const profileResponse = await httpClient.get('/users/me', {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
          },
        })

        const profile = profileResponse.data?.data

        if (!profile) {
          router.replace('/login')
          return
        }

        setProfile(profile)
        router.replace(DEFAULT_REDIRECT_PATH)
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const status = err.response?.status ?? 500
          const data = err.response?.data
          console.error('[kakao exchange] axios error', status, data)

          return NextResponse.json(
            { message: 'backend_exchange_failed', status, data },
            { status }, // ✅ 실제 status 그대로 전달
          )
        }
      }
    }

    void run()
  }, [router, searchParams, setAccessToken, setProfile])

  return null
}
