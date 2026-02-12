'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { useCardDetails, useFeedbackPolling } from '@/features/levelup-feedback'

const FAILED_REDIRECT_DELAY_MS = 3000
const MAX_ATTEMPTS = 5

type LevelUpFeedbackControllerDeps = {
  accessToken: string | null
  createAttempt: (
    accessToken: string,
    cardId: number,
    initialDurationSeconds: number,
  ) => Promise<{ ok: boolean; data?: { attemptId?: number; attemptNo?: number } }>
  deleteAttempt: (
    accessToken: string,
    cardId: number,
    attemptId: number,
  ) => Promise<{ ok: boolean }>
  initialAttemptDurationSeconds: number
  onIncreaseActiveCardCount: () => void
}

export function useLevelUpFeedbackController({
  accessToken,
  createAttempt,
  deleteAttempt,
  initialAttemptDurationSeconds,
  onIncreaseActiveCardCount,
}: LevelUpFeedbackControllerDeps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isExitAlertOpen, setIsExitAlertOpen] = useState(false)
  const [isCreatingAttempt, setIsCreatingAttempt] = useState(false)
  const cardId = Number(searchParams.get('cardId') ?? '')
  const attemptId = Number(searchParams.get('attemptId') ?? '')
  const { data } = useCardDetails(accessToken ?? '', cardId)

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
  const remainingAttempts =
    feedbackData.length > 0 ? Math.max(0, MAX_ATTEMPTS - feedbackAttemptNo) : '-'

  const handleBack = () => {
    setIsExitAlertOpen(true)
  }

  const handleRestudyClick = async () => {
    if (!cardId) {
      toast.error('카드 정보를 찾을 수 없습니다.')
      return
    }
    if (!accessToken) {
      toast.error('로그인이 필요합니다.')
      return
    }

    setIsCreatingAttempt(true)
    const response = await createAttempt(accessToken, cardId, initialAttemptDurationSeconds)
    setIsCreatingAttempt(false)
    if (!response.ok) {
      toast.error('학습 시작을 준비하지 못했습니다. 다시 시도해주세요.')
      return
    }

    const nextAttemptId = response.data?.attemptId
    const nextAttemptNo = response.data?.attemptNo
    if (!nextAttemptId || !nextAttemptNo) {
      toast.error('학습 시도를 준비하지 못했습니다. 다시 시도해주세요.')
      return
    }

    router.push(
      `/levelup/record?cardId=${cardId}&attemptId=${nextAttemptId}&attemptNo=${nextAttemptNo}`,
    )
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

  const handleEndLearning = () => {
    if (status === 'COMPLETED') {
      onIncreaseActiveCardCount()
    }
    router.replace('/main')
  }

  const isRestudyDisabled = remainingAttempts === 0 || isCreatingAttempt

  return {
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
  }
}
