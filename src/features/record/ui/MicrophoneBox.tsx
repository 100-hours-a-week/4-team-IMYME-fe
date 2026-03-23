'use client'

import { CircleStop, Mic } from 'lucide-react'
import { useEffect, useState } from 'react'

type MicrophoneBoxProps = {
  isStartingWarmup?: boolean
  warmupError?: boolean
  onMicClick: () => void
  title: string
  description: string
  errorMessage: string
  isMicDisabled: boolean
  isRecording: boolean
  isPaused: boolean
  getElapsedSeconds: () => number
  minimumRecordingSecondsBeforeStop?: number
}

const WRAPPER_CLASSNAME = 'mt-4 flex w-full flex-col items-center'
const BOX_CLASSNAME =
  'border-secondary bg-var(--color-background) flex h-90 w-90 flex-col items-center gap-6 rounded-2xl border-2'
const ERROR_CLASSNAME = 'text-sm text-red-600'
const MIC_ICON_ACTIVE_CLASSNAME = 'text-primary cursor-pointer'
const MIC_ICON_DISABLED_CLASSNAME = 'text-gray-400 cursor-pointer'
const RECORDING_LABEL_CLASSNAME = 'text-sm text-red-500'
const PAUSED_LABEL_CLASSNAME = 'text-sm text-red-500'
const SECONDS_PER_MINUTE = 60
const TIME_PAD_LENGTH = 2
const ELAPSED_TIME_TICK_MS = 500
const DEFAULT_MINIMUM_RECORDING_SECONDS_BEFORE_STOP = 0

const formatElapsedTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE)
  const seconds = totalSeconds % SECONDS_PER_MINUTE
  return `${minutes}:${String(seconds).padStart(TIME_PAD_LENGTH, '0')}`
}

export function MicrophoneBox({
  isStartingWarmup,
  warmupError,
  onMicClick,
  title,
  description,
  errorMessage,
  isMicDisabled,
  isRecording,
  isPaused,
  getElapsedSeconds,
  minimumRecordingSecondsBeforeStop = DEFAULT_MINIMUM_RECORDING_SECONDS_BEFORE_STOP,
}: MicrophoneBoxProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const displayedElapsedSeconds = isRecording ? elapsedSeconds : 0

  useEffect(() => {
    if (!isRecording || isPaused) {
      return
    }

    const timerId = window.setInterval(() => {
      setElapsedSeconds(getElapsedSeconds())
    }, ELAPSED_TIME_TICK_MS)

    return () => {
      window.clearInterval(timerId)
    }
  }, [getElapsedSeconds, isPaused, isRecording])

  const isStopBlockedByMinimumDuration =
    isRecording && displayedElapsedSeconds < minimumRecordingSecondsBeforeStop
  const isButtonDisabled = isStartingWarmup || isMicDisabled || isStopBlockedByMinimumDuration

  const micIconClassName = isButtonDisabled
    ? MIC_ICON_DISABLED_CLASSNAME
    : MIC_ICON_ACTIVE_CLASSNAME
  const recordingLabel = `녹음 중... ${formatElapsedTime(displayedElapsedSeconds)}`

  return (
    <div className={WRAPPER_CLASSNAME}>
      <div className={BOX_CLASSNAME}>
        <p className="mt-6 text-sm">{title}</p>
        <p className="max-w-75 text-center text-sm text-pretty">{description}</p>
        {warmupError ? <p className={ERROR_CLASSNAME}>{errorMessage}</p> : null}
        <button
          type="button"
          className="border-secondary flex h-40 w-40 items-center justify-center rounded-full border-4"
          onClick={onMicClick}
          disabled={isButtonDisabled}
        >
          {isPaused ? (
            <CircleStop
              size={100}
              className={micIconClassName}
            />
          ) : (
            <Mic
              size={100}
              className={micIconClassName}
            />
          )}
        </button>
        <div className="flex flex-col items-center">
          {isRecording && !isPaused ? (
            <p className={RECORDING_LABEL_CLASSNAME}>{recordingLabel}</p>
          ) : null}
          {isPaused ? <p className={PAUSED_LABEL_CLASSNAME}>일시정지 중...</p> : null}
        </div>
      </div>
    </div>
  )
}
