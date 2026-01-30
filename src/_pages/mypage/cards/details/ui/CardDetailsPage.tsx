'use client'

import { useParams, useRouter } from 'next/navigation'

import { useAccessToken } from '@/features/auth/model/client/useAuthStore'
import { LevelUpHeader } from '@/features/levelup'
import { FeedbackTab, useCardDetails } from '@/features/levelup-feedback'
import { useFeedbackData, CardInfo } from '@/features/levelup-feedback'
import { SubjectHeader, formatDate } from '@/shared'
import { Button } from '@/shared/ui/button'

export function CardDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const cardIdParam = params.id?.toString()
  const cardId = cardIdParam ? Number(cardIdParam) : undefined
  const accessToken = useAccessToken()
  const { data } = useCardDetails(accessToken, cardId)
  const { feedbackData } = useFeedbackData(data ?? null)

  const remainingAttempts = data ? Math.max(0, 5 - data.attemptCount) : 0

  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <LevelUpHeader
        variant="feedback"
        onBack={() => router.back()}
        progressValue={0}
        stepLabel={''}
        title={data?.title}
      />
      <SubjectHeader
        variant="completed"
        categoryValue={data?.categoryName ?? ''}
        keywordValue={data?.keywordName ?? ''}
      />
      <CardInfo
        createdAt={formatDate(data?.createdAt ?? '')}
        bestLevel={data?.bestLevel ?? null}
        attemptNo={feedbackData.length}
        attemptCount={data?.attemptCount ?? null}
      />
      <FeedbackTab feedbackData={feedbackData} />
      <div className="flex w-full justify-center">
        <p className="text-sm">남은 학습 횟수: {remainingAttempts}</p>
      </div>
      <div className="mt-auto flex w-full justify-center pb-6">
        <Button
          className="border-primary text-primary bg-var(--color-background) h-10 w-60 rounded-xl border"
          size={'lg'}
        >
          이어서 학습하기
        </Button>
      </div>
    </div>
  )
}
