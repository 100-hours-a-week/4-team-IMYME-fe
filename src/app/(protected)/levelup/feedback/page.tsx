import { Suspense } from 'react'

import { LevelUpFeedbackPage } from '@/_pages/levelup'

export default function Page() {
  return (
    <Suspense fallback={<div></div>}>
      <LevelUpFeedbackPage />
    </Suspense>
  )
}
