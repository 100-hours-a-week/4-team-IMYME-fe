'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { deleteCard } from '@/entities/card'
import { useAccessToken } from '@/features/auth/model/client/useAuthStore'
import { LevelUpHeader, startWarmup } from '@/features/levelup'
import { useCardDetails } from '@/features/levelup-feedback'
import { MicrophoneBox, useMicrophone } from '@/features/record'
import { completeAudioUpload, getAudioUrl, uploadAudio } from '@/features/record'
import { createAttempt } from '@/features/record/api/createAttempt'
import { AlertModal, RecordTipBox, SubjectHeader } from '@/shared'
import { Button } from '@/shared/ui/button'

const RECORD_PROGRESS_VALUE = 100
const RECORD_STEP_LABEL = '3/3'
const REDIRECT_DELAY_MS = 1500
const DEFAULT_AUDIO_EXTENSION = 'webm'
const MIME_EXTENSION_MAP: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/mp4': 'mp4',
}
const getAudioPublicUrl = (uploadUrl: string) => {
  try {
    const url = new URL(uploadUrl)
    url.search = ''
    url.hash = ''
    return url.toString()
  } catch {
    return uploadUrl
  }
}
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
  const {
    isMicAlertOpen,
    setIsMicAlertOpen,
    startRecording,
    stopRecordingAndGetBlob,
    recordedBlob,
    isRecording,
    isPaused,
    pauseRecording,
    resumeRecording,
    elapsedSeconds,
    getDurationSeconds,
  } = useMicrophone()
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

    if (isRecording) {
      if (isPaused) {
        resumeRecording()
      } else {
        pauseRecording()
      }
      return
    }

    setIsStartingWarmup(true)
    const response = await startWarmup(accessToken, { cardId })
    setIsStartingWarmup(false)

    if (!response) {
      setWarmupError(true)
      toast.error('음성 녹음 시작에 실패하였습니다. 다시 시도해주세요.')
      return
    }

    const started = await startRecording()
    if (!started) return
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

  const handleMicAlertClose = () => {
    setIsMicAlertOpen(false)
  }

  const handleRecordingComplete = async () => {
    if (!accessToken || !cardId) return

    const completedBlob = await stopRecordingAndGetBlob()
    if (!completedBlob) {
      toast.error('녹음 파일이 없습니다. 다시 녹음해주세요.')
      return
    }

    const durationSeconds = getDurationSeconds()
    const attemptResult = await createAttempt(accessToken, cardId, durationSeconds)
    if (!attemptResult.ok || !attemptResult.data?.attemptId) {
      toast.error('학습 시도 생성에 실패했습니다. 다시 시도해주세요.')
      return
    }

    const attemptId = attemptResult.data.attemptId
    const fileExtension = MIME_EXTENSION_MAP[completedBlob.type] ?? DEFAULT_AUDIO_EXTENSION
    const audioUrlResult = await getAudioUrl(accessToken, cardId, fileExtension)
    if (!audioUrlResult.ok) {
      toast.error('오디오 업로드 URL을 가져오지 못했습니다. 다시 시도해주세요.')
      return
    }

    const uploadUrl = audioUrlResult.data?.uploadUrl
    if (!uploadUrl) {
      toast.error('오디오 업로드 URL이 비어있습니다.')
      return
    }

    const uploadResult = await uploadAudio(uploadUrl, completedBlob, fileExtension)
    if (!uploadResult.ok) {
      toast.error('오디오 업로드에 실패했습니다. 다시 시도해주세요.')
      return
    }

    const audioUrl = getAudioPublicUrl(uploadUrl)
    const completeResult = await completeAudioUpload(
      accessToken,
      cardId,
      attemptId,
      audioUrl,
      durationSeconds,
    )
    if (!completeResult.ok) {
      toast.error('오디오 업로드에 실패했습니다. 다시 시도해주세요.')
      return
    }

    router.push(`/levelup/feedback?cardId=${cardId}&attemptId=${attemptId}`)
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
      <MicrophoneBox
        isStartingWarmup={isStartingWarmup}
        warmupError={warmupError}
        onMicClick={handleMicClick}
        title="음성으로 말해보세요."
        description="버튼을 눌러 녹음을 시작하세요."
        errorMessage="녹음 시작에 실패했습니다. 메인으로 이동합니다."
        isMicDisabled={Boolean(recordedBlob)}
        isRecording={isRecording}
        isPaused={isPaused}
        elapsedSeconds={elapsedSeconds}
      />
      <RecordTipBox />
      <div className="mt-4 flex w-full items-center justify-center gap-4">
        <Button
          variant="record_confirm_btn"
          onClick={handleRecordingComplete}
        >
          녹음 완료 및 피드백 받기
        </Button>
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
      <AlertModal
        open={isMicAlertOpen}
        onOpenChange={setIsMicAlertOpen}
        title="마이크 권한이 필요합니다."
        description="브라우저 설정에서 마이크 권한을 허용해주세요."
        action="확인"
        cancel="닫기"
        onAction={handleMicAlertClose}
        onCancel={handleMicAlertClose}
      />
    </div>
  )
}
