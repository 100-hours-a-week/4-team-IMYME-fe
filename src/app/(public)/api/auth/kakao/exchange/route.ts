import axios from 'axios'
import { NextRequest, NextResponse } from 'next/server'

import { httpClient } from '@/shared'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const code = body.code as string | undefined
  const deviceUuid = body.device_uuid as string | undefined

  if (!code || !deviceUuid) {
    return NextResponse.json({ message: 'missing_params' }, { status: 400 })
  }

  const redirectUri = process.env.NEXT_KAKAO_REDIRECT_URI ?? ''

  console.log(`code: ${code}`)
  console.log(`deviceUuid: ${deviceUuid}`)
  console.log(`redirectUri: ${redirectUri}`)

  // ✅ 백엔드에 교환 요청
  try {
    const response = await httpClient.post(
      '/auth/oauth/kakao',
      {
        code,
        redirect_uri: redirectUri,
        device_uuid: deviceUuid,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )

    console.log('[exchange] backend raw response:', response)
    const access_token = response.data?.data?.access_token
    const refresh_token = response.data?.data?.refresh_token

    if (!access_token) {
      return NextResponse.json({ message: 'invalid_response' }, { status: 502 })
    }

    const res = NextResponse.json({
      access_token,
      device_uuid: deviceUuid,
    })

    if (refresh_token) {
      res.cookies.set('refresh_token', String(refresh_token), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 3600, // 예시: 14일 (백엔드 만료와 맞추세요)
      })
    }
    return res
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
