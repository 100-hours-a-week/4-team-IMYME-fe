import axios from 'axios'
import { NextRequest, NextResponse } from 'next/server'

import { setAccessTokenCookies, setRefreshTokenCookie } from '@/features/auth/server'
import { httpClient } from '@/shared/api'

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
    const expiresIn = Number(response.data?.data?.expiresIn ?? 0)
    const user = response.data?.data?.user

    if (!accessToken || !user) {
      return NextResponse.json({ message: 'invalid_response' }, { status: 502 })
    }

    const res = NextResponse.json({
      accessToken,
      expiresIn,
      deviceUuid,
      user: {
        id: user.id,
        nickname: user.nickname,
        profileImageUrl: user.profileImageUrl,
        level: user.level,
        activeCardCount: user.activeCardCount,
        consecutiveDays: user.consecutiveDays,
        winCount: user.winCount,
      },
    })

    // 로그인 직후부터 서버/클라이언트가 같은 access token cookie를 공유한다.
    setAccessTokenCookies(res, String(accessToken), expiresIn)

    if (refreshToken) {
      setRefreshTokenCookie(res, String(refreshToken))
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

    return NextResponse.json({ message: 'backend_exchange_failed' }, { status: 500 })
  }
}
