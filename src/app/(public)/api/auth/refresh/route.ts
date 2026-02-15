import axios from 'axios'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { httpClient } from '@/shared'

const REFRESH_TOKEN_COOKIE = 'refresh_token'
const COOKIE_PATH = '/'

const clearRefreshTokenCookie = (res: NextResponse) => {
  res.cookies.set(REFRESH_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SECURE === 'true',
    sameSite: 'lax',
    path: COOKIE_PATH,
    maxAge: 0,
  })
}

export async function POST(req: Request) {
  const refreshToken = (await cookies()).get('refresh_token')?.value
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || req.url

  if (!refreshToken) {
    const res = NextResponse.redirect(new URL('/login', baseUrl))
    clearRefreshTokenCookie(res)
    return res
  }

  try {
    const response = await httpClient.post(
      '/auth/refresh',
      { refreshToken }, // 백엔드가 snake_case면 이걸로
      { headers: { 'Content-Type': 'application/json' } },
    )

    const accessToken = response.data?.data?.accessToken
    const nextRefreshToken = response.data?.data?.refreshToken

    if (!accessToken) {
      const res = NextResponse.redirect(new URL('/login', baseUrl))
      clearRefreshTokenCookie(res)
      return res
    }

    const res = NextResponse.json({ access_token: accessToken })

    if (nextRefreshToken) {
      res.cookies.set('refresh_token', String(nextRefreshToken), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SECURE === 'true',
        sameSite: 'lax',
        path: '/',
      })
    }

    return res
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status ?? 500
      const data = err.response?.data
      console.error('[token refresh error]', status, data)
    }
    const res = NextResponse.redirect(new URL('/login', baseUrl))
    clearRefreshTokenCookie(res)
    return res
  }
}
