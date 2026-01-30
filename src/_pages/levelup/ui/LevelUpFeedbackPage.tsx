import { LevelUpHeader } from '@/features/levelup'

export function LevelUpFeedbackPage() {
  const handleBack = () => {}
  return (
    <div className="h-full w-full">
      <LevelUpHeader
        variant="feedback"
        onBack={handleBack}
        title=""
        progressValue={100}
        stepLabel="AI 피드백"
      />
    </div>
  )
}
