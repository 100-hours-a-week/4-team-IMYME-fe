import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })

  res.cookies.set('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SECURE === 'true',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return res
}
