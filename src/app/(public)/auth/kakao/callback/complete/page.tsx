import { Suspense } from 'react'

import { KakaoCallbackPage } from '@/_pages/auth-callback'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <KakaoCallbackPage />
    </Suspense>
  )
}
