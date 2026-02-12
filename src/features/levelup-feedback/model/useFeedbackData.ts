'use client'

import { useMemo } from 'react'

import { useAccessToken } from '@/features/auth'
import {
  useAttemptDetailsList,
  type CardDetails,
  type FeedbackItem,
} from '@/features/levelup-feedback'

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

  const feedbackData: FeedbackItem[] = (attemptQueries ?? [])
    .map((query, index) => {
      const data = query?.data
      const feedback = data?.feedback
      if (!feedback) return null

      return {
        id: data.attemptId ?? attemptParams[index]?.attemptId ?? 0,
        attemptNo: attemptParams[index]?.attemptIndex ?? 0,
        summary: feedback.summary ?? '',
        keywords: feedback.keywords ?? '',
        facts: feedback.facts ?? '',
        understanding: feedback.understanding ?? '',
        socraticFeedback: feedback.socraticFeedback ?? '',
        createdAt: feedback.createdAt ?? '',
      } as FeedbackItem
    })
    .filter((item): item is FeedbackItem => item != null)
    .sort((a, b) => b.attemptNo - a.attemptNo)

  return { feedbackData, isLoading }
}
