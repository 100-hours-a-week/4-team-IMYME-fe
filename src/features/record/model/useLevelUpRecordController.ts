'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { deleteCard } from '@/entities/card'
import { useAccessToken } from '@/features/auth'
import { startWarmup } from '@/features/levelup'
import { deleteAttempt, useCardDetails } from '@/features/levelup-feedback'
import { completeAudioUpload, getAudioUrl, uploadAudio, useMicrophone } from '@/features/record'

import type { FeedbackStatus } from '@/features/levelup-feedback'

// ✅ 워밍업 실패 시 리다이렉트 딜레이(ms)
const REDIRECT_DELAY_MS = 1500

const DEFAULT_CONTENT_TYPE: SupportedAudioContentType = 'audio/webm'
type SupportedAudioContentType = 'audio/mp4' | 'audio/webm' | 'audio/wav' | 'audio/mpeg'

// ✅ 브라우저에서 나올 수 있는 Blob MIME → 서버에 넘길 Content-Type을 정규화
const MIME_TO_CONTENT_TYPE_MAP: Record<string, SupportedAudioContentType> = {
  'audio/webm': 'audio/webm',
  'audio/mp4': 'audio/mp4',
  'audio/wav': 'audio/wav',
  'audio/mpeg': 'audio/mpeg',
}

// ✅ 컨트롤러 훅이 외부(UI)에 제공할 값/핸들러 타입
type UseLevelUpRecordControllerResult = {
  data: ReturnType<typeof useCardDetails>['data']
  isSubmittingFeedback: boolean
  uploadStatus: FeedbackStatus | null
  isStartingWarmup: boolean
  warmupError: boolean
  isMicAlertOpen: boolean
  isBackAlertOpen: boolean
  isRecording: boolean
  isPaused: boolean
  elapsedSeconds: number
  recordedBlob: Blob | null
  handleMicClick: () => Promise<void>
  handleBackConfirm: () => Promise<void>
  handleBackCancel: () => void
  handleMicAlertOpenChange: (open: boolean) => void
  handleBackAlertOpenChange: (open: boolean) => void
  handleRecordingComplete: () => Promise<void>
}

export function useLevelUpRecordController(): UseLevelUpRecordControllerResult {
  const router = useRouter()

  const searchParams = useSearchParams()

  // ⚠️ searchParams.get(...)이 null이면 Number(null) => 0 이 아니라 Number(null) === 0? (실제로 Number(null)=0)
  // ⚠️ null이 아니라 undefined는 아니지만, 값이 없을 때 0/NaN 케이스가 섞여 들어갈 수 있어 "유효성 체크"가 중요
  const cardId = Number(searchParams.get('cardId'))
  const attemptNo = Number(searchParams.get('attemptNo'))
  const attemptId = Number(searchParams.get('attemptId'))

  const accessToken = useAccessToken()

  // ⚠️ cardId가 NaN/0이면 내부 훅에서 요청이 나가면 안 되도록 방어되어 있어야 안전
  const { data } = useCardDetails(accessToken, cardId)

  // ✅ 녹음 관련 상태/액션들 (useMicrophone이 모든 녹음/권한/타이머 관리)
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
    clearRecordedBlob,
    autoStopped,
    resetAutoStopped,
  } = useMicrophone()

  const [isBackAlertOpen, setIsBackAlertOpen] = useState(false)

  const [warmupError, setWarmupError] = useState(false)
  const [isStartingWarmup, setIsStartingWarmup] = useState(false)

  const [uploadStatus, setUploadStatus] = useState<FeedbackStatus | null>(null)

  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  // ✅ 워밍업 실패 시 일정 시간 뒤 /main으로 이동
  useEffect(() => {
    if (!warmupError) return

    const timeoutId = window.setTimeout(() => {
      router.push('/main')
    }, REDIRECT_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [router, warmupError])

  // ✅ 마이크 버튼 클릭 핸들러
  // - 이미 녹음 중이면: pause/resume 토글
  // - 녹음 중이 아니면: warmup → startRecording
  const handleMicClick = async () => {
    // ✅ 필수값 없으면 아무것도 하지 않음
    if (!accessToken || !cardId) return

    // ✅ 이미 녹음 중이면 일시정지/재개 토글
    if (isRecording) {
      if (isPaused) {
        resumeRecording()
      } else {
        pauseRecording()
      }
      return
    }

    // ✅ 녹음 시작 전 서버 워밍업
    setIsStartingWarmup(true)
    const response = await startWarmup(accessToken, { cardId })
    setIsStartingWarmup(false)

    // ✅ 워밍업 실패 처리
    if (!response) {
      setWarmupError(true)
      toast.error('음성 녹음에 실패하였습니다. 잠시 후 다시 시도해주세요.')
      return
    }

    // ✅ 실제 녹음 시작
    const started = await startRecording()
    if (!started) return
  }

  const handleBackConfirm = async () => {
    setIsBackAlertOpen(false)

    // ✅ 시도(attempt)가 존재하고, 첫 시도가 아니라면 attempt 삭제 후 메인 이동
    // ⚠️ attemptId/attemptNo가 NaN일 수 있으니 유효성 체크가 더 안전
    if (accessToken && cardId && attemptId && attemptNo !== 1) {
      await deleteAttempt(accessToken, cardId, attemptId)
      router.push('/main')
      return
    }

    // ✅ 그 외에는 카드 자체 삭제 후 메인 이동
    if (accessToken && cardId) {
      await deleteCard(accessToken, cardId)
    }
    router.push('/main')
  }

  const handleBackCancel = () => {
    setIsBackAlertOpen(false)
  }

  // ✅ 마이크 권한/안내 모달 open 제어
  const handleMicAlertOpenChange = (open: boolean) => {
    setIsMicAlertOpen(open)
  }

  // ✅ 뒤로가기 모달 open 제어
  const handleBackAlertOpenChange = (open: boolean) => {
    setIsBackAlertOpen(open)
  }

  // ✅ 녹음 완료 → presigned url 발급 → S3 PUT 업로드 → 업로드 완료 콜백 → 피드백 화면 이동
  const handleRecordingComplete = useCallback(async () => {
    // ✅ 중복 실행 방지
    if (isSubmittingFeedback) return

    if (!accessToken || !cardId || !attemptId) return

    setIsSubmittingFeedback(true)

    // ✅ 녹음 중지 + Blob 생성
    const completedBlob = await stopRecordingAndGetBlob()

    // ✅ Blob 생성 실패 처리
    if (!completedBlob) {
      setIsSubmittingFeedback(false)
      toast.error('녹음 파일을 생성하던 중 오류가 발생했습니다. 다시 녹음해주세요.')
      return
    }

    const durationSeconds = getDurationSeconds()

    // ✅ Blob.type이 "audio/webm;codecs=opus" 형태면 세미콜론 전까지만 취함
    const normalizedMimeType = completedBlob.type.split(';')[0]

    // ✅ 지원 목록으로 정규화(없으면 기본값)
    const contentType = MIME_TO_CONTENT_TYPE_MAP[normalizedMimeType] ?? DEFAULT_CONTENT_TYPE

    // ✅ (백엔드) presigned URL + objectKey + (서명에 사용된) contentType 발급 요청
    const audioUrlResult = await getAudioUrl(accessToken, attemptId, contentType)
    if (!audioUrlResult.ok) {
      setIsSubmittingFeedback(false)
      toast.error('오디오 업로드 URL을 가져오지 못했습니다. 다시 시도해주세요.')
      return
    }

    const uploadUrl = audioUrlResult.data?.uploadUrl
    const objectKey = audioUrlResult.data?.objectKey
    const uploadContentType = audioUrlResult.data?.contentType

    // ✅ 필수값 누락 시 에러 처리
    if (!uploadUrl || !objectKey || !uploadContentType) {
      setIsSubmittingFeedback(false)
      toast.error('오디오 업로드 정보를 가져오지 못했습니다.')
      return
    }

    // ✅ S3 PUT 업로드
    const uploadResult = await uploadAudio(uploadUrl, completedBlob, uploadContentType)
    if (!uploadResult.ok) {
      setIsSubmittingFeedback(false)
      toast.error('오디오 업로드에 실패했습니다. 다시 시도해주세요.')
      return
    }

    // ✅ 백엔드에 “업로드 완료” 알림 (메타데이터 저장, 상태 전환 등)
    const completeResult = await completeAudioUpload(
      accessToken,
      cardId,
      attemptId,
      objectKey,
      durationSeconds,
    )
    if (!completeResult.ok) {
      setIsSubmittingFeedback(false)
      toast.error('오디오 업로드에 실패했습니다. 다시 시도해주세요.')
      return
    }

    // ✅ 서버 처리 상태가 PENDING이면 UI 상태 업데이트
    if (completeResult.data?.status === 'PENDING') {
      setUploadStatus('PENDING')
    }

    // ✅ 로컬 녹음 데이터 정리
    clearRecordedBlob()

    // ✅ 피드백 페이지로 넘길 쿼리스트링 구성
    const feedbackParams = new URLSearchParams({
      cardId: String(cardId),
      attemptId: String(attemptId),
    })

    // ⚠️ 현재 attemptNo는 number인데 null 비교가 의미가 약함(Number(null)=0 / 값 없으면 NaN 등)
    //    유효한 숫자일 때만 set 하는 게 안전
    if (attemptNo !== null) {
      feedbackParams.set('attemptNo', String(attemptNo))
    }

    router.replace(`/levelup/feedback?${feedbackParams.toString()}`)
  }, [
    isSubmittingFeedback,
    accessToken,
    cardId,
    attemptId,
    attemptNo,
    stopRecordingAndGetBlob,
    getDurationSeconds,
    clearRecordedBlob,
    setIsSubmittingFeedback,
    setUploadStatus,
    router,
  ])

  // ✅ 녹음 시간 1분 초과로 인해 자동 종료(autoStopped) 발생 시 즉시 업로드 플로우 실행
  useEffect(() => {
    // ✅ 자동 종료 + Blob 존재 + 업로드 중이 아닐 때만 실행
    if (!autoStopped || !recordedBlob || isSubmittingFeedback) return

    // ✅ autoStopped 플래그 초기화
    resetAutoStopped()

    // ✅ 다음 tick에서 완료 처리 실행(상태 업데이트 순서 꼬임 방지)
    setTimeout(() => {
      void handleRecordingComplete()
    }, 0)
  }, [autoStopped, handleRecordingComplete, isSubmittingFeedback, recordedBlob, resetAutoStopped])

  return {
    data,
    isSubmittingFeedback,
    uploadStatus,
    isStartingWarmup,
    warmupError,
    isMicAlertOpen,
    isBackAlertOpen,
    isRecording,
    isPaused,
    elapsedSeconds,
    recordedBlob,
    handleMicClick,
    handleBackConfirm,
    handleBackCancel,
    handleMicAlertOpenChange,
    handleBackAlertOpenChange,
    handleRecordingComplete,
  }
}
