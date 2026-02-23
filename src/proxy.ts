import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/main', '/mypage', '/levelup', '/']
const LOGIN_PATH = '/login'
const MAIN_PATH = '/main'
const REFRESH_TOKEN_COOKIE = 'refresh_token'
const REDIRECT_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? process.env.NEXT_PUBLIC_SITE_URL
const FORWARDED_HOST_HEADER = 'x-forwarded-host'
const FORWARDED_PROTO_HEADER = 'x-forwarded-proto'
const HOST_HEADER = 'host'
const HTTPS_PROTOCOL = 'https'

const extractFirstForwardedValue = (headerValue: string | null) => {
  if (!headerValue) {
    return null
  }

  const [firstValue] = headerValue.split(',')
  return firstValue?.trim() || null
}

const isProtectedPath = (pathname: string) =>
  PROTECTED_PATHS.some((path) => pathname.startsWith(path))

const createRedirectUrl = (path: string, request: NextRequest) => {
  if (REDIRECT_BASE_URL) {
    try {
      return new URL(path, REDIRECT_BASE_URL)
    } catch {
      // Fall through to request-based resolution.
    }
  }

  const forwardedHost = extractFirstForwardedValue(request.headers.get(FORWARDED_HOST_HEADER))
  const forwardedProto = extractFirstForwardedValue(request.headers.get(FORWARDED_PROTO_HEADER))
  const host = request.headers.get(HOST_HEADER)
  const fallbackBaseUrl = request.nextUrl.origin

  if (forwardedHost) {
    const protocol = forwardedProto ?? HTTPS_PROTOCOL
    return new URL(path, `${protocol}://${forwardedHost}`)
  }

  if (host) {
    const protocol = forwardedProto ?? request.nextUrl.protocol.replace(':', '') ?? HTTPS_PROTOCOL
    return new URL(path, `${protocol}://${host}`)
  }

  return new URL(path, fallbackBaseUrl)
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/') {
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value
    if (refreshToken) {
      const redirectUrl = createRedirectUrl(MAIN_PATH, request)
      return NextResponse.redirect(redirectUrl)
    }
    const redirectUrl = createRedirectUrl(LOGIN_PATH, request)
    return NextResponse.redirect(redirectUrl)
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next()
  }

  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value
  if (!refreshToken) {
    const redirectUrl = createRedirectUrl(LOGIN_PATH, request)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/main/:path*', '/mypage/:path*', '/levelup/:path*'],
}
