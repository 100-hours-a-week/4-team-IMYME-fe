'use client'

import { useCallback, useState } from 'react'

import { useMicrophone } from '@/shared/lib/useMicrophone'

// 공통 녹음 컨트롤러가 UI에 제공하는 최소/공통 상태와 액션
export type UseRecordControllerResult = {
  isStartingWarmup: boolean
  warmupError: boolean
  isMicAlertOpen: boolean
  isRecording: boolean
  isPaused: boolean
  recordedBlob: Blob | null
  autoStopped: boolean
  handleMicClick: () => Promise<void>
  handleMicAlertOpenChange: (open: boolean) => void
  stopRecordingAndGetBlob: () => Promise<Blob | null>
  getElapsedSeconds: () => number
  getDurationSeconds: () => number
  clearRecordedBlob: () => void
  resetAutoStopped: () => void
}

type UseRecordControllerOptions = {
  canPause?: boolean
}

export function useRecordController({
  canPause = true,
}: UseRecordControllerOptions = {}): UseRecordControllerResult {
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
    getElapsedSeconds,
    getDurationSeconds,
    clearRecordedBlob,
    autoStopped,
    resetAutoStopped,
  } = useMicrophone()

  // 현재 공통 컨트롤러는 warmup 개념을 모르므로 UI 호환을 위해 고정값을 제공한다.
  const [isStartingWarmup] = useState(false)
  const [warmupError] = useState(false)

  const handleMicClick = useCallback(async () => {
    if (isRecording) {
      if (!canPause) return
      if (isPaused) {
        resumeRecording()
      } else {
        pauseRecording()
      }
      return
    }

    await startRecording()
  }, [canPause, isPaused, isRecording, pauseRecording, resumeRecording, startRecording])

  const handleMicAlertOpenChange = (open: boolean) => {
    setIsMicAlertOpen(open)
  }

  return {
    isStartingWarmup,
    warmupError,
    isMicAlertOpen,
    isRecording,
    isPaused,
    recordedBlob,
    autoStopped,
    handleMicClick,
    handleMicAlertOpenChange,
    stopRecordingAndGetBlob,
    getElapsedSeconds,
    getDurationSeconds,
    clearRecordedBlob,
    resetAutoStopped,
  }
}
