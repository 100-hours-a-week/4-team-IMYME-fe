'use client'

import { Mic } from 'lucide-react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { deleteCard } from '@/entities/card'
import { useAccessToken } from '@/features/auth/model/client/useAuthStore'
import { LevelUpHeader } from '@/features/levelup'
import { startWarmup } from '@/features/levelup/model/startWarmup'
import { useCardDetails } from '@/features/levelup-feedback'
import { AlertModal, SubjectHeader } from '@/shared'
import { Button } from '@/shared/ui/button'

const RECORD_PROGRESS_VALUE = 100
const RECORD_STEP_LABEL = '3/3'
const REDIRECT_DELAY_MS = 1500

export function LevelUpRecordPage() {
  const router = useRouter()

  const params = useParams()
  const searchParams = useSearchParams()
  const cardIdFromQuery = searchParams.get('cardId')
  const attemptIdFromQuery = searchParams.get('attemptId')
  const cardIdFromParams = params.id?.toString()
  const cardIdValue = cardIdFromQuery ?? cardIdFromParams
  const cardId = cardIdValue ? Number(cardIdValue) : undefined

  const accessToken = useAccessToken()
  const { data } = useCardDetails(accessToken, cardId)
  const [isBackAlertOpen, setIsBackAlertOpen] = useState(false)
  const [warmupError, setWarmupError] = useState(false)
  const [isStartingWarmup, setIsStartingWarmup] = useState(false)

  useEffect(() => {
    if (!warmupError) return

    const timeoutId = window.setTimeout(() => {
      router.push('/main')
    }, REDIRECT_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [router, warmupError])

  const handleMicClick = async () => {
    if (!accessToken || !cardId) return

    setIsStartingWarmup(true)
    const response = await startWarmup(accessToken, { cardId })
    setIsStartingWarmup(false)

    if (!response) {
      setWarmupError(true)
    }
  }

  const handleBack = () => {
    const hasAttemptId = Boolean(attemptIdFromQuery)
    if (!hasAttemptId) {
      setIsBackAlertOpen(true)
      return
    }

    router.push('/main')
  }

  const handleBackConfirm = async () => {
    setIsBackAlertOpen(false)
    if (accessToken && cardId) {
      await deleteCard(accessToken, cardId)
    }
    router.push('/main')
  }

  const handleBackCancel = () => {
    setIsBackAlertOpen(false)
  }

  return (
    <div className="h-full w-full">
      <LevelUpHeader
        variant="recording"
        onBack={handleBack}
        progressValue={RECORD_PROGRESS_VALUE}
        stepLabel={RECORD_STEP_LABEL}
      />
      <SubjectHeader
        variant="in_progress"
        categoryValue={data?.categoryName ?? ''}
        keywordValue={data?.keywordName ?? ''}
      />
      <div className="mt-4 flex w-full flex-col items-center">
        <div className="border-secondary bg-var(--color-background) flex h-90 w-90 flex-col items-center gap-6 rounded-2xl border-2">
          <p className="mt-6 text-sm">음성으로 말해보세요.</p>
          <p className="text-sm">버튼을 눌러 녹음을 시작하세요.</p>
          {warmupError ? (
            <p className="text-sm text-red-600">녹음 시작에 실패했습니다. 메인으로 이동합니다.</p>
          ) : null}
          <button
            type="button"
            className="border-secondary flex h-40 w-40 items-center justify-center rounded-full border-4"
            onClick={handleMicClick}
            disabled={isStartingWarmup}
          >
            <Mic size={100} />
          </button>
        </div>
      </div>
      <div className="mt-4 flex w-full flex-col items-center">
        <div className="border-secondary bg-var(--color-background) flex h-30 w-90 flex-col items-start justify-center gap-1 rounded-2xl border text-start">
          <p className="ml-4">녹음 팁</p>
          <p className="ml-4 text-sm">조용한 장소에서 녹음하세요.</p>
          <p className="ml-4 text-sm">명확하게 발음하세요.</p>
          <p className="ml-4 text-sm">자연스러운 속도로 말하세요.</p>
        </div>
      </div>
      <div className="mt-4 flex w-full items-center justify-center">
        <Button variant="record_confirm_btn">녹음 완료 및 피드백 받기</Button>
      </div>
      <AlertModal
        open={isBackAlertOpen}
        onOpenChange={setIsBackAlertOpen}
        title="학습을 취소하시겠습니까?"
        description="현재 생성한 카드가 삭제될 수 있습니다."
        action="나가기"
        cancel="계속하기"
        onAction={handleBackConfirm}
        onCancel={handleBackCancel}
      />
    </div>
  )
}
