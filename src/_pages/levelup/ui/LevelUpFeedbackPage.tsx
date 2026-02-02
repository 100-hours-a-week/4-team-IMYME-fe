'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { useAccessToken } from '@/features/auth'
import {
  deleteAttempt,
  FeedbackLoader,
  FeedbackTab,
  useCardDetails,
  useFeedbackPolling,
} from '@/features/levelup-feedback'
import { AlertModal, LevelUpHeader, SubjectHeader } from '@/shared'
import { Button } from '@/shared/ui/button'

const FAILED_REDIRECT_DELAY_MS = 3000

export function LevelUpFeedbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const accessToken = useAccessToken()
  const [isExitAlertOpen, setIsExitAlertOpen] = useState(false)
  const cardId = Number(searchParams.get('cardId') ?? '')
  const attemptId = Number(searchParams.get('attemptId') ?? '')
  const { data } = useCardDetails(accessToken, cardId)

  const deleteAttemptMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken || !cardId || !attemptId) {
        throw new Error('missing_params')
      }
      const result = await deleteAttempt(accessToken, cardId, attemptId)
      if (!result.ok) {
        throw new Error('delete_failed')
      }
    },
    retry: 1,
  })

  const handleTimeout = useCallback(async () => {
    toast.error('피드백 생성 시간이 초과되었습니다.')
    try {
      await deleteAttemptMutation.mutateAsync()
    } catch {
      toast.error('삭제에 실패했습니다. 다시 시도해주세요.')
    }
    router.push('/main')
  }, [deleteAttemptMutation, router])

  const handleFailed = useCallback(() => {
    toast.error('피드백 생성에 실패했습니다. 다시 시도해주세요.')
    window.setTimeout(() => {
      router.push('/main')
    }, FAILED_REDIRECT_DELAY_MS)
  }, [router])

  const { status, processingStep, feedbackData } = useFeedbackPolling({
    accessToken,
    cardId,
    attemptId,
    onTimeout: handleTimeout,
    onFailed: handleFailed,
  })

  const feedbackAttemptNo = feedbackData[0]?.attemptNo ?? 0
  const remainingAttempts = feedbackData.length > 0 ? Math.max(0, 5 - feedbackAttemptNo) : 0

  const handleBack = () => {
    setIsExitAlertOpen(true)
  }

  const handleExitConfirm = async () => {
    if (feedbackData.length === 0) {
      try {
        await deleteAttemptMutation.mutateAsync()
      } catch {
        toast.error('삭제에 실패했습니다. 다시 시도해주세요.')
        return
      }
    }
    router.push('/main')
  }

  const handleExitCancel = () => {
    setIsExitAlertOpen(false)
  }
  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <LevelUpHeader
        variant="feedback"
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
            onClick={() => {
              if (!cardId) return
              router.push(`/levelup/record?cardId=${cardId}`)
            }}
            disabled={remainingAttempts === 0}
          >
            이어서 학습하기
          </Button>
          <Button
            variant="levelup_feedback_btn"
            onClick={() => {
              router.push('/main')
            }}
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
