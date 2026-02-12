import axios from 'axios'
import { NextRequest, NextResponse } from 'next/server'

import { httpClient } from '@/shared'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const code = body.code as string | undefined
  const deviceUuid = body.deviceUuid as string | undefined

  if (!code || !deviceUuid) {
    return NextResponse.json({ message: 'missing_params' }, { status: 400 })
  }

  const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI ?? ''

  try {
    const response = await httpClient.post(
      '/auth/oauth/kakao',
      {
        code,
        redirectUri,
        deviceUuid,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )

    const accessToken = response.data?.data?.accessToken
    const refreshToken = response.data?.data?.refreshToken
    const user = response.data?.data?.user

    if (!accessToken || !user) {
      return NextResponse.json({ message: 'invalid_response' }, { status: 502 })
    }

    const res = NextResponse.json({
      accessToken,
      deviceUuid,
      user: {
        nickname: user.nickname,
        profileImageUrl: user.profileImageUrl,
        level: user.level,
        activeCardCount: user.activeCardCount,
        consecutiveDays: user.consecutiveDays,
        winCount: user.winCount,
      },
    })

    if (refreshToken) {
      res.cookies.set('refresh_token', String(refreshToken), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SECURE === 'true',
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
