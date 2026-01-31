'use client'

import { FeedbackLoader } from '@/features/feedback'
import { LevelUpHeader } from '@/features/levelup'
import { SubjectHeader } from '@/shared'

export function LevelUpFeedbackPage() {
  const handleBack = () => {}
  return (
    <div className="h-full w-full">
      <LevelUpHeader
        variant="feedback"
        onBack={handleBack}
        title=""
        progressValue={100}
        stepLabel="3/3"
      />
      <SubjectHeader
        variant="in_progress"
        categoryValue=""
        keywordValue=""
      />
      <FeedbackLoader status="PENDING" />
    </div>
  )
}
