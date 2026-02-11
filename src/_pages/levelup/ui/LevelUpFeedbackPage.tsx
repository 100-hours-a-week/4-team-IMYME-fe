'use client'

import { useOptimisticActiveCardCount } from '@/entities/user'
import { useAccessToken } from '@/features/auth'
import { INITIAL_ATTEMPT_DURATION_SECONDS } from '@/features/levelup'
import {
  deleteAttempt,
  FeedbackLoader,
  FeedbackTab,
  useLevelUpFeedbackController,
} from '@/features/levelup-feedback'
import { createAttempt } from '@/features/record'
import { AlertModal, ModeHeader, SubjectHeader, Button } from '@/shared'

const ACTIVE_CARD_COUNT_INCREMENT = 1

export function LevelUpFeedbackPage() {
  const accessToken = useAccessToken()
  const { applyDelta } = useOptimisticActiveCardCount()
  const {
    data,
    status,
    processingStep,
    feedbackData,
    remainingAttempts,
    isExitAlertOpen,
    setIsExitAlertOpen,
    isRestudyDisabled,
    handleBack,
    handleRestudyClick,
    handleEndLearning,
    handleExitConfirm,
    handleExitCancel,
  } = useLevelUpFeedbackController({
    accessToken,
    createAttempt,
    deleteAttempt,
    initialAttemptDurationSeconds: INITIAL_ATTEMPT_DURATION_SECONDS,
    onIncreaseActiveCardCount: () => applyDelta(ACTIVE_CARD_COUNT_INCREMENT),
  })
  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <ModeHeader
        mode="levelup"
        step="feedback"
        onBack={handleBack}
        title=""
        progressValue={100}
        stepLabel="3/3"
      />
      <SubjectHeader
        variant="in_progress"
        categoryValue={data?.categoryName ?? ''}
        keywordValue={data?.keywordName ?? ''}
      />
      <div className="min-h-0 flex-1">
        {status === 'COMPLETED' && feedbackData.length > 0 ? (
          <FeedbackTab
            feedbackData={feedbackData}
            showButtons={false}
          />
        ) : (
          <FeedbackLoader
            status={status}
            step={processingStep}
          />
        )}
      </div>
      <div className="mt-auto flex w-full flex-col items-center justify-center gap-4">
        <p className="mb-3 text-sm">남은 학습 횟수: {remainingAttempts}</p>
        <div className="mb-6 flex w-full items-center justify-center gap-4">
          <Button
            variant="levelup_feedback_btn"
            onClick={handleRestudyClick}
            disabled={isRestudyDisabled}
          >
            이어서 학습하기
          </Button>
          <Button
            variant="levelup_feedback_btn"
            onClick={handleEndLearning}
          >
            학습 종료하기
          </Button>
        </div>
      </div>
      <AlertModal
        open={isExitAlertOpen}
        onOpenChange={setIsExitAlertOpen}
        title="학습을 종료할까요?"
        description="진행 중인 피드백이 삭제될 수 있습니다."
        action="나가기"
        cancel="계속하기"
        onAction={handleExitConfirm}
        onCancel={handleExitCancel}
      />
    </div>
  )
}
