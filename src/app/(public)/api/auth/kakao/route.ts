// app/api/auth/kakao/route.ts
import { NextRequest, NextResponse } from 'next/server'

export function GET(_req: NextRequest) {
  const state = crypto.randomUUID()

  const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!

  const authorizeUrl = new URL('https://kauth.kakao.com/oauth/authorize')
  authorizeUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!)
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('state', state)

  const res = NextResponse.redirect(authorizeUrl)
  res.cookies.set('kakao_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10분
  })

  return res
}
