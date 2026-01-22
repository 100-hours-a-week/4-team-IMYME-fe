import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: 'mine-frontend',
      ts: new Date().toISOString(),
    },
    { status: 200 },
  )
}
