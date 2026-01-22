import { NextRequest, NextResponse } from 'next/server'

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

  console.log('kakao code: ', code)
  // 다음 단계: 서버에서 code를 access/refresh token으로 교환

  return NextResponse.redirect(new URL('/main', req.url))
}
