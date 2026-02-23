import { NextRequest, NextResponse } from 'next/server'

const LOGIN_PATH = '/login'
const KAKAO_COMPLETE_PATH = '/auth/callback/kakao/complete'
const REDIRECT_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? process.env.NEXT_PUBLIC_SITE_URL

const createRedirectUrl = (path: string, request: NextRequest) => {
  if (REDIRECT_BASE_URL) {
    try {
      return new URL(path, REDIRECT_BASE_URL)
    } catch {
      // Fall through to request origin.
    }
  }

  return new URL(path, request.nextUrl.origin)
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl
  const code = url.searchParams.get('code')
  const returnedState = url.searchParams.get('state')
  const storedState = req.cookies.get('kakao_oauth_state')?.value

  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')

  if (error) {
    const redirectUrl = createRedirectUrl(LOGIN_PATH, req)
    redirectUrl.searchParams.set('error', error)
    if (errorDescription) redirectUrl.searchParams.set('error_description', errorDescription)

    const res = NextResponse.redirect(redirectUrl)
    res.cookies.set('kakao_oauth_state', '', { maxAge: 0, path: '/' })
    return res
  }

  if (!code) {
    const res = NextResponse.redirect(createRedirectUrl(LOGIN_PATH, req))
    res.cookies.set('kakao_oauth_state', '', { maxAge: 0, path: '/' })
    return res
  }

  if (!returnedState || !storedState || returnedState !== storedState) {
    const redirectUrl = createRedirectUrl(LOGIN_PATH, req)
    redirectUrl.searchParams.set('error', 'invalid_state')

    const res = NextResponse.redirect(redirectUrl)
    res.cookies.set('kakao_oauth_state', '', { maxAge: 0, path: '/' })
    return res
  }

  const redirectUrl = createRedirectUrl(KAKAO_COMPLETE_PATH, req)
  redirectUrl.searchParams.set('code', code)

  const res = NextResponse.redirect(redirectUrl)
  res.cookies.set('kakao_oauth_state', '', { maxAge: 0, path: '/' })
  return res
}
