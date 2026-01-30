'use client'

import { useMemo } from 'react'

import { useAccessToken } from '@/features/auth/model/client/useAuthStore'
import { useAttemptDetailsList } from '@/features/levelup-feedback'

import type { CardDetails } from '@/features/levelup-feedback'
import type { FeedbackItem } from '@/features/levelup-feedback/ui/FeedbackTab'

type UseFeedbackDataResult = {
  feedbackData: FeedbackItem[]
  isLoading: boolean
}

export function useFeedbackData(cardDetails: CardDetails | null): UseFeedbackDataResult {
  const accessToken = useAccessToken()

  const attemptParams = useMemo(() => {
    const attempts =
      cardDetails?.attempts
        ?.slice()
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) ?? []

    return attempts.map((attempt, index) => ({
      cardId: cardDetails?.id ?? 0,
      attemptId: attempt.id,
      attemptIndex: index + 1,
    }))
  }, [cardDetails])

  const attemptQueries = useAttemptDetailsList(accessToken, attemptParams)
  const isLoading = attemptQueries.some((query) => query.isLoading)

  const feedbackData: FeedbackItem[] = attemptQueries
    .map((query, index) => ({
      data: query.data,
      attemptIndex: attemptParams[index]?.attemptIndex ?? 0,
    }))
    .filter((item): item is { data: NonNullable<typeof item.data>; attemptIndex: number } =>
      Boolean(item.data),
    )
    .map((item) => ({
      id: item.data.attemptId,
      attemptNo: item.attemptIndex,
      summary: item.data.feedback.summary,
      keywords: item.data.feedback.keywords,
      facts: item.data.feedback.facts,
      understanding: item.data.feedback.understanding,
      socraticFeedback: item.data.feedback.socraticFeedback,
      createdAt: item.data.feedback.createdAt,
    }))
    .sort((a, b) => b.attemptNo - a.attemptNo)

  return { feedbackData, isLoading }
}
