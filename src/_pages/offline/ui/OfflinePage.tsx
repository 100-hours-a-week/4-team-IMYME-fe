'use client'

import Link from 'next/link'

const RETRY_BUTTON_LABEL = '다시 시도'
const LOGIN_LINK_LABEL = '로그인으로 이동'
const PAGE_TITLE = '오프라인 상태입니다'
const PAGE_DESCRIPTION = '네트워크 연결을 확인한 뒤 다시 시도해주세요.'

export function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-105 flex-col items-center justify-center px-6 text-center">
      <h1 className="text-primary text-2xl font-semibold">{PAGE_TITLE}</h1>
      <p className="text-muted-foreground mt-3 text-sm">{PAGE_DESCRIPTION}</p>
      <div className="mt-8 flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={handleRetry}
          className="bg-primary text-primary-foreground h-11 rounded-lg text-sm font-medium"
        >
          {RETRY_BUTTON_LABEL}
        </button>
        <Link
          href="/login"
          className="border-border text-foreground inline-flex h-11 items-center justify-center rounded-lg border text-sm font-medium"
        >
          {LOGIN_LINK_LABEL}
        </Link>
      </div>
    </main>
  )
}
