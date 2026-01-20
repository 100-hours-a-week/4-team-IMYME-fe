import { NextResponse, NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: '/',
}
