'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { useAccessToken } from '@/features/auth'
import { FeedbackTab, useCardDetails } from '@/features/levelup-feedback'
import { useFeedbackData, CardInfo } from '@/features/levelup-feedback'
import { createAttempt } from '@/features/record'
import { LevelUpHeader, SubjectHeader, formatDate, Button } from '@/shared'

const INITIAL_ATTEMPT_DURATION_SECONDS = 0

export function CardDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const cardIdParam = params.id?.toString()
  const cardId = cardIdParam ? Number(cardIdParam) : undefined
  const accessToken = useAccessToken()
  const { data } = useCardDetails(accessToken, cardId)
  const { feedbackData } = useFeedbackData(data ?? null)
  const [isCreatingAttempt, setIsCreatingAttempt] = useState(false)
  const [selectedAttemptNo, setSelectedAttemptNo] = useState<number | null>(null)

  const remainingAttempts = data ? Math.max(0, 5 - data.attemptCount) : 0

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
    const response = await createAttempt(accessToken, cardId, INITIAL_ATTEMPT_DURATION_SECONDS)
    setIsCreatingAttempt(false)
    if (!response.ok) {
      toast.error('학습 시작을 준비하지 못했습니다. 다시 시도해주세요.')
      return
    }

    const attemptId = response.data?.attemptId
    const attemptNo = response.data?.attemptNo
    if (!attemptId || !attemptNo) {
      toast.error('학습 시도를 준비하지 못했습니다. 다시 시도해주세요.')
      return
    }

    router.push(`/levelup/record?cardId=${cardId}&attemptId=${attemptId}&attemptNo=${attemptNo}`)
  }

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
        attemptNo={selectedAttemptNo}
        attemptCount={data?.attemptCount ?? null}
      />
      <FeedbackTab
        feedbackData={feedbackData}
        onAttemptNoChange={setSelectedAttemptNo}
      />
      <div className="flex w-full justify-center">
        <p className="text-sm">남은 학습 횟수: {remainingAttempts}</p>
      </div>
      <div className="mt-auto mb-6 flex w-full justify-center pt-4">
        <Button
          className="border-primary text-primary bg-var(--color-background) h-10 w-60 cursor-pointer rounded-xl border"
          size={'lg'}
          onClick={handleRestudyClick}
          disabled={remainingAttempts === 0 || isCreatingAttempt}
        >
          이어서 학습하기
        </Button>
      </div>
    </div>
  )
}
