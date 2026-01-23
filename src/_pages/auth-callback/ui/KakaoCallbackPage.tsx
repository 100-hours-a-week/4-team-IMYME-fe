'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

const DEVICE_UUID_STORAGE_KEY = 'device_uuid'
const KAKAO_CODE_QUERY_KEY = 'code'
const DEFAULT_REDIRECT_PATH = '/main'

const createDeviceUuid = () => {
  if (typeof crypto?.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  console.error('crypto.randomUUID is not available in this browser')
  return ''
}

export function KakaoCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get(KAKAO_CODE_QUERY_KEY)

    if (!code) {
      router.replace('/login')
      return
    }

    const existingDeviceUuid = localStorage.getItem(DEVICE_UUID_STORAGE_KEY)

    if (!existingDeviceUuid) {
      const deviceUuid = createDeviceUuid()

      if (deviceUuid) {
        localStorage.setItem(DEVICE_UUID_STORAGE_KEY, deviceUuid)
      }
    }

    router.replace(DEFAULT_REDIRECT_PATH)
  }, [router, searchParams])

  return null
}
