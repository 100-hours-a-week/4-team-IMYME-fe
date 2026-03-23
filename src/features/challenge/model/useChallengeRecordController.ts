'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useRecordController } from '@/features/record'
import { resolveAudioContentType } from '@/shared/lib/audioContentType'

import { completeChallengeAttemptUpload } from '../api/completeChallengeAttemptUpload'
import { createChallengeAttempt } from '../api/createChallengeAttempt'
import { uploadChallengeAttemptAudio } from '../api/uploadChallengeAttemptAudio'

import type { FeedbackStatus } from '@/features/levelup-feedback'

type UseChallengeRecordControllerResult = {
  isSubmittingFeedback: boolean
  isSubmissionCompleted: boolean
  uploadStatus: FeedbackStatus | null
  isStartingWarmup: boolean
  warmupError: boolean
  isMicAlertOpen: boolean
  isRecording: boolean
  isPaused: boolean
  recordedBlob: Blob | null
  canSubmitRecording: boolean
  handleMicClick: () => Promise<void>
  handleMicAlertOpenChange: (open: boolean) => void
  getElapsedSeconds: () => number
  handleRecordingComplete: () => Promise<void>
}

type UseChallengeRecordControllerParams = {
  challengeId: number | null
  challengeEndAt: string | null
}

const MINIMUM_SUBMIT_DURATION_SECONDS = 1
const TOO_SHORT_RECORDING_ERROR_MESSAGE = '1초 이상 녹음한 뒤 제출해주세요.'
const MS_PER_SECOND = 1_000
const AUTO_SUBMIT_DELAY_MS = 0
const CREATE_CHALLENGE_ATTEMPT_ERROR_MESSAGE =
  '챌린지 제출 생성에 실패했습니다. 잠시 후 다시 시도해주세요.'
const UPLOAD_CHALLENGE_ATTEMPT_AUDIO_ERROR_MESSAGE =
  '챌린지 음성 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.'
const COMPLETE_CHALLENGE_ATTEMPT_UPLOAD_ERROR_MESSAGE =
  '챌린지 업로드 완료 처리에 실패했습니다. 잠시 후 다시 시도해주세요.'

const getChallengeCloseTimeMs = (challengeEndAt: string | null): number | null => {
  if (!challengeEndAt) {
    return null
  }

  const challengeCloseDate = new Date(challengeEndAt)
  const challengeCloseTimeMs = challengeCloseDate.getTime()

  if (!Number.isFinite(challengeCloseTimeMs)) {
    return null
  }

  return challengeCloseTimeMs
}

export function useChallengeRecordController({
  challengeId,
  challengeEndAt,
}: UseChallengeRecordControllerParams): UseChallengeRecordControllerResult {
  const {
    isMicAlertOpen,
    isRecording,
    isPaused,
    getElapsedSeconds,
    getDurationSeconds,
    recordedBlob,
    autoStopped,
    handleMicClick: handleBaseMicClick,
    handleMicAlertOpenChange,
    stopRecordingAndGetBlob,
    resetAutoStopped,
  } = useRecordController({ canPause: false })

  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [isSubmissionCompleted, setIsSubmissionCompleted] = useState(false)
  const [uploadStatus] = useState<FeedbackStatus | null>(null)
  const [isStartingWarmup] = useState(false)
  const [warmupError] = useState(false)
  const [canSubmitRecording, setCanSubmitRecording] = useState(false)
  const isAutoStoppingRef = useRef(false)

  useEffect(() => {
    if (!isRecording) {
      setCanSubmitRecording(false)
      return
    }

    setCanSubmitRecording(false)
    const enableTimerId = window.setTimeout(() => {
      setCanSubmitRecording(true)
    }, MINIMUM_SUBMIT_DURATION_SECONDS * MS_PER_SECOND)

    return () => {
      window.clearTimeout(enableTimerId)
    }
  }, [isRecording])

  // 챌린지 마감 시각(endAt)에 도달하면 녹음을 자동으로 종료한다.
  useEffect(() => {
    if (!isRecording) return

    const now = new Date()
    const challengeCloseTimeMs = getChallengeCloseTimeMs(challengeEndAt)
    if (!challengeCloseTimeMs) return

    const msUntilChallengeClose = challengeCloseTimeMs - now.getTime()

    const stopRecordingAtChallengeClose = async () => {
      if (isAutoStoppingRef.current) return
      isAutoStoppingRef.current = true
      try {
        await stopRecordingAndGetBlob()
      } finally {
        isAutoStoppingRef.current = false
      }
    }

    if (msUntilChallengeClose <= 0) {
      void stopRecordingAtChallengeClose()
      return
    }

    const stopTimerId = window.setTimeout(() => {
      void stopRecordingAtChallengeClose()
    }, msUntilChallengeClose)

    return () => {
      window.clearTimeout(stopTimerId)
    }
  }, [challengeEndAt, isRecording, stopRecordingAndGetBlob])

  const handleMicClick = useCallback(async () => {
    if (isRecording) return
    await handleBaseMicClick()
  }, [handleBaseMicClick, isRecording])

  const handleRecordingComplete = useCallback(async () => {
    if (isSubmittingFeedback) return
    if (!challengeId) return
    const durationSeconds = getDurationSeconds()
    if (durationSeconds < MINIMUM_SUBMIT_DURATION_SECONDS) {
      toast.error(TOO_SHORT_RECORDING_ERROR_MESSAGE)
      return
    }

    setIsSubmittingFeedback(true)
    setIsSubmissionCompleted(false)
    try {
      const completedBlob = await stopRecordingAndGetBlob()
      if (!completedBlob) return

      const normalizedMimeType = completedBlob.type.split(';')[0]
      const contentType = resolveAudioContentType(normalizedMimeType)
      const challengeAttemptResult = await createChallengeAttempt(challengeId, contentType)

      if (!challengeAttemptResult.ok) {
        toast.error(CREATE_CHALLENGE_ATTEMPT_ERROR_MESSAGE)
        return
      }

      const uploadChallengeAttemptAudioResult = await uploadChallengeAttemptAudio(
        challengeAttemptResult.data.uploadUrl,
        completedBlob,
        contentType,
      )

      if (!uploadChallengeAttemptAudioResult.ok) {
        toast.error(UPLOAD_CHALLENGE_ATTEMPT_AUDIO_ERROR_MESSAGE)
        return
      }

      const completeChallengeAttemptUploadResult = await completeChallengeAttemptUpload(
        challengeId,
        challengeAttemptResult.data.attemptId,
        {
          objectKey: challengeAttemptResult.data.objectKey,
          durationSeconds,
        },
      )

      if (!completeChallengeAttemptUploadResult.ok) {
        toast.error(COMPLETE_CHALLENGE_ATTEMPT_UPLOAD_ERROR_MESSAGE)
        return
      }

      setIsSubmissionCompleted(true)
    } finally {
      setIsSubmittingFeedback(false)
    }
  }, [challengeId, getDurationSeconds, isSubmittingFeedback, stopRecordingAndGetBlob])

  useEffect(() => {
    if (!autoStopped || !recordedBlob || isSubmittingFeedback) return

    resetAutoStopped()

    const timeoutId = window.setTimeout(() => {
      void handleRecordingComplete()
    }, AUTO_SUBMIT_DELAY_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [autoStopped, handleRecordingComplete, isSubmittingFeedback, recordedBlob, resetAutoStopped])

  return {
    isSubmittingFeedback,
    isSubmissionCompleted,
    uploadStatus,
    isStartingWarmup,
    warmupError,
    isMicAlertOpen,
    isRecording,
    isPaused,
    recordedBlob,
    canSubmitRecording,
    handleMicClick,
    handleMicAlertOpenChange,
    getElapsedSeconds,
    handleRecordingComplete,
  }
}
