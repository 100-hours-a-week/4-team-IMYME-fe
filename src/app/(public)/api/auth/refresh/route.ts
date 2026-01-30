import axios from 'axios'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { httpClient } from '@/shared'

export async function POST() {
  const refreshToken = (await cookies()).get('refresh_token')?.value

  if (!refreshToken) {
    return NextResponse.json({ message: 'no_refresh_token' }, { status: 401 })
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
      return NextResponse.json({ message: 'invalid_refresh_response' }, { status: 502 })
    }

    const res = NextResponse.json({ access_token: accessToken })

    if (nextRefreshToken) {
      res.cookies.set('refresh_token', String(nextRefreshToken), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
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

      return NextResponse.json({ message: 'backend_token_refresh_error', status, data }, { status })
    }
    return NextResponse.json({ message: 'internal_error' }, { status: 500 })
  }
}
