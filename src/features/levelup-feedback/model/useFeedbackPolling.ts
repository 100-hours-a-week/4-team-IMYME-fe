'use client'

import { useEffect, useState } from 'react'

import {
  getAttemptDetails,
  FeedbackItem,
  FeedbackProcessingStep,
  FeedbackStatus,
  PROCESSING_STEPS,
} from '@/features/levelup-feedback'

const POLL_INTERVAL_MS = 3000
const FEEDBACK_TIMEOUT_MS = 5 * 60 * 1000
const DEFAULT_FEEDBACK_STATUS: FeedbackStatus = 'PROCESSING'

type UseFeedbackPollingOptions = {
  accessToken: string | null
  cardId?: number
  attemptId?: number
  onTimeout?: () => void | Promise<void>
  onFailed?: () => void | Promise<void>
}

type UseFeedbackPollingResult = {
  status: FeedbackStatus
  processingStep: FeedbackProcessingStep | null
  feedbackData: FeedbackItem[]
}

const isValidStatus = (status: string): status is FeedbackStatus =>
  status === 'PENDING' ||
  status === 'PROCESSING' ||
  status === 'COMPLETED' ||
  status === 'FAILED' ||
  status === 'EXPIRED'

const isProcessingStep = (step?: string | null): step is FeedbackProcessingStep =>
  Boolean(step) && PROCESSING_STEPS.includes(step as FeedbackProcessingStep)

export function useFeedbackPolling({
  accessToken,
  cardId,
  attemptId,
  onTimeout,
  onFailed,
}: UseFeedbackPollingOptions): UseFeedbackPollingResult {
  const [status, setStatus] = useState<FeedbackStatus>(DEFAULT_FEEDBACK_STATUS)
  const [processingStep, setProcessingStep] = useState<FeedbackProcessingStep | null>(null)
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([])

  const hasCompletedFeedback = status === 'COMPLETED' && feedbackData.length > 0

  useEffect(() => {
    if (!accessToken || !cardId || !attemptId || hasCompletedFeedback) return

    let isActive = true
    let intervalId: number | null = null
    let timeoutId: number | null = null

    const stopPolling = () => {
      isActive = false
      if (intervalId) {
        window.clearInterval(intervalId)
      }
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }

    const pollAttemptDetails = async () => {
      if (!isActive) return
      const details = await getAttemptDetails(accessToken, cardId, attemptId)
      if (!details?.status) return
      if (isValidStatus(details.status)) {
        setStatus(details.status)
        if (details.status === 'PROCESSING' && isProcessingStep(details.step)) {
          setProcessingStep(details.step)
        } else {
          setProcessingStep(null)
        }
        if (details.status === 'COMPLETED' && details.feedback) {
          setFeedbackData([
            {
              id: details.attemptId,
              attemptNo: details.attemptNo,
              summary: details.feedback.summary,
              keywords: details.feedback.keywords,
              facts: details.feedback.facts,
              understanding: details.feedback.understanding,
              socraticFeedback: details.feedback.socraticFeedback,
              createdAt: new Date(details.createdAt),
            },
          ])
          stopPolling()
        }
        if (details.status === 'FAILED') {
          stopPolling()
          void onFailed?.()
        }
      }
    }

    const handleTimeout = async () => {
      stopPolling()
      await onTimeout?.()
    }

    void pollAttemptDetails()
    intervalId = window.setInterval(pollAttemptDetails, POLL_INTERVAL_MS)
    timeoutId = window.setTimeout(handleTimeout, FEEDBACK_TIMEOUT_MS)

    return () => {
      stopPolling()
    }
  }, [accessToken, attemptId, cardId, hasCompletedFeedback, onFailed, onTimeout])

  return { status, processingStep, feedbackData }
}
