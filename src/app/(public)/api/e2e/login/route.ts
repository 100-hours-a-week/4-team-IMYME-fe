import { NextResponse } from 'next/server'

import { httpClient } from '@/shared'

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://dev.imymemine.kr/server'

// ✅ middleware(proxy.ts)에서 확인하는 쿠키 이름과 반드시 동일
const REFRESH_TOKEN_COOKIE = 'refresh_token'

export async function POST(req: Request) {
  // ✅ 운영에 노출 방지 (명시 플래그로만 허용)
  if (process.env.ALLOW_E2E_LOGIN !== 'true') {
    return NextResponse.json({ message: 'Not allowed' }, { status: 404 })
  }

  const { deviceUuid } = (await req.json()) as { deviceUuid: string }

  let accessToken = ''
  let refreshToken = ''

  try {
    const response = await httpClient.post(
      '/e2e/login',
      { deviceUuid },
      {
        baseURL: BACKEND_BASE_URL,
        headers: { 'Content-Type': 'application/json' },
      },
    )

    const data = response.data?.data as { accessToken: string; refreshToken: string } | undefined
    accessToken = data?.accessToken ?? ''
    refreshToken = data?.refreshToken ?? ''
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    return NextResponse.json({ message: 'E2E login failed', detail: message }, { status: 500 })
  }

  if (!accessToken || !refreshToken) {
    return NextResponse.json(
      { message: 'E2E login failed', detail: 'empty tokens' },
      { status: 500 },
    )
  }

  // ✅ refresh_token 쿠키로 심어 middleware gate 통과시키기
  const res = NextResponse.json(
    { data: { accessToken } }, // accessToken은 디버깅/확인용으로만. 없어도 됨.
    { status: 200 },
  )

  res.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // 로컬 http면 false (https면 true)
    path: '/',
  })

  return res
}
