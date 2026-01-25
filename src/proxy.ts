import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/main', '/mypage', '/levelup']
const LOGIN_PATH = '/login'
const REFRESH_TOKEN_COOKIE = 'refresh_token'

const isProtectedPath = (pathname: string) =>
  PROTECTED_PATHS.some((path) => pathname.startsWith(path))

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isProtectedPath(pathname)) {
    return NextResponse.next()
  }

  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value
  if (!refreshToken) {
    const redirectUrl = new URL(LOGIN_PATH, request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/main/:path*', '/mypage/:path*', '/levelup/:path*'],
}
