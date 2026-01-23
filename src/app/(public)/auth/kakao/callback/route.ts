import { NextRequest, NextResponse } from 'next/server'

import { httpClient } from '@/shared'

export async function GET(req: NextRequest) {
  const url = req.nextUrl
  const code = url.searchParams.get('code')
  const returnedState = url.searchParams.get('state')
  const storedState = req.cookies.get('kakao_oauth_state')?.value

  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')

  if (error) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('error', error)
    if (errorDescription) redirectUrl.searchParams.set('error_description', errorDescription)

    const res = NextResponse.redirect(redirectUrl)

    res.cookies.set('kakao_oauth_state', '', { maxAge: 0, path: '/' })

    return res
  }

  if (!code) {
    const redirectUrl = new URL('/login', req.url)
    const res = NextResponse.redirect(redirectUrl)

    res.cookies.set('kakao_oauth_state', '', { maxAge: 0, path: '/' })

    return res
  }

  if (!returnedState || !storedState || returnedState !== storedState) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('error', 'invalid_state')

    const res = NextResponse.redirect(redirectUrl)

    res.cookies.set('kakao_oauth_state', '', { maxAge: 0, path: '/' })

    return res
  }

  const deviceUuid = crypto.randomUUID()
  const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI ?? ''

  console.log('kakao code: ', code)
  // 다음 단계: 서버에서 code를 access/refresh token으로 교환
  try {
    const response = await httpClient.post('/auth/oauth/kakao', {
      code,
      redirect_uri: redirectUri,
      device_uuid: deviceUuid,
    })

    console.log(response)

    const deviceId = response.data?.deviceId
    const accessToken = response.data?.accessToken
    const refreshToken = response.data?.refreshToken

    if (deviceId && accessToken) {
      // deviceId && accessToken으로 나중에 수정하기
      const redirectUrl = new URL('/auth/kakao/callback/complete', req.url)
      redirectUrl.searchParams.set('code', code)

      if (deviceId) redirectUrl.searchParams.set('device_id', String(deviceId))
      if (accessToken) redirectUrl.searchParams.set('access_token', String(accessToken))

      const res = NextResponse.redirect(redirectUrl)

      if (refreshToken) {
        res.cookies.set('refresh_token', String(refreshToken), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        })
      }

      return res
    }

    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('error', 'not_found_device_id')

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Failed to exchange Kakao code', error)
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('error', 'kakao_exchange_failed')

    return NextResponse.redirect(redirectUrl)
  }
}
