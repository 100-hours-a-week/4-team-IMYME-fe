'use client'

import { useEffect, useRef, useState } from 'react'

import { startMediaRecorder } from '@/features/record'

const MAX_RECORDING_MS = 60_000
const TIMER_INTERVAL_MS = 500
const DEFAULT_MIC_PERMISSION_STATE = 'unavailable'

type UseMicrophoneResult = {
  isRecording: boolean
  isPaused: boolean
  elapsedSeconds: number
  micPermissionState: string
  isMicAlertOpen: boolean
  setIsMicAlertOpen: (open: boolean) => void
  recordedBlob: Blob | null
  playRecordedAudio: () => boolean
  startRecording: () => Promise<boolean>
  stopRecordingAndGetBlob: () => Promise<Blob | null>
  getDurationSeconds: () => number
  pauseRecording: () => void
  resumeRecording: () => void
  stopRecording: () => void
}

export function useMicrophone(): UseMicrophoneResult {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [micPermissionState, setMicPermissionState] = useState<string>(DEFAULT_MIC_PERMISSION_STATE)
  const [isMicAlertOpen, setIsMicAlertOpen] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null)
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null)
  const recordTimeoutRef = useRef<number | null>(null)
  const elapsedIntervalRef = useRef<number | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  const recordStartAtRef = useRef<number | null>(null)
  const elapsedMsRef = useRef<number>(0)
  const remainingMsRef = useRef<number>(MAX_RECORDING_MS)
  const stopResolveRef = useRef<((blob: Blob | null) => void) | null>(null)

  useEffect(() => {
    if (!isRecording || isPaused) return

    elapsedIntervalRef.current = window.setInterval(() => {
      if (!recordStartAtRef.current) return
      const elapsedMs = elapsedMsRef.current + (Date.now() - recordStartAtRef.current)
      setElapsedSeconds(Math.floor(Math.max(0, elapsedMs) / 1000))
    }, TIMER_INTERVAL_MS)

    return () => {
      if (elapsedIntervalRef.current) {
        window.clearInterval(elapsedIntervalRef.current)
        elapsedIntervalRef.current = null
      }
    }
  }, [isPaused, isRecording])

  useEffect(() => {
    return () => {
      if (recordTimeoutRef.current) {
        window.clearTimeout(recordTimeoutRef.current)
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
      }
      if (recordingStream) {
        recordingStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [recordingStream])

  const stopRecording = () => {
    if (recordTimeoutRef.current) {
      window.clearTimeout(recordTimeoutRef.current)
      recordTimeoutRef.current = null
    }

    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }

    if (recordingStream) {
      recordingStream.getTracks().forEach((track) => track.stop())
    }

    setRecorder(null)
    setRecordingStream(null)
    setIsRecording(false)
    setIsPaused(false)
    recordStartAtRef.current = null
    elapsedMsRef.current = 0
    remainingMsRef.current = MAX_RECORDING_MS
    setElapsedSeconds(0)
  }

  const checkPermission = async () => {
    if (typeof window === 'undefined') return false
    if (!navigator.permissions?.query) {
      setMicPermissionState(DEFAULT_MIC_PERMISSION_STATE)
      return false
    }

    try {
      const status = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      setMicPermissionState(status.state)
      if (status.state === 'denied') {
        setIsMicAlertOpen(true)
        return false
      }
    } catch {
      setMicPermissionState(DEFAULT_MIC_PERMISSION_STATE)
      return false
    }

    return true
  }

  const requestPermission = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicPermissionState(DEFAULT_MIC_PERMISSION_STATE)
      return false
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      return true
    } catch {
      setIsMicAlertOpen(true)
      return false
    }
  }

  const startRecording = async () => {
    const canCheck = await checkPermission()
    if (!canCheck) return false

    const hasPermission = await requestPermission()
    if (!hasPermission) return false

    if (isRecording) {
      stopRecording()
      return false
    }

    const startResult = await startMediaRecorder()
    if (!startResult.ok) {
      setIsMicAlertOpen(true)
      return false
    }

    chunksRef.current = []
    setRecordedBlob(null)
    startResult.recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }
    startResult.recorder.onstop = () => {
      const hasChunks = chunksRef.current.length > 0
      const blob = hasChunks
        ? new Blob(chunksRef.current, { type: startResult.recorder.mimeType })
        : null
      if (blob) {
        setRecordedBlob(blob)
      }
      chunksRef.current = []
      if (stopResolveRef.current) {
        const resolve = stopResolveRef.current
        stopResolveRef.current = null
        resolve(blob)
      }
    }

    setRecorder(startResult.recorder)
    setRecordingStream(startResult.stream)
    setIsRecording(true)
    setIsPaused(false)
    recordStartAtRef.current = Date.now()
    elapsedMsRef.current = 0
    remainingMsRef.current = MAX_RECORDING_MS
    setElapsedSeconds(0)
    recordTimeoutRef.current = window.setTimeout(() => {
      stopRecording()
    }, MAX_RECORDING_MS)
    return true
  }

  const pauseRecording = () => {
    if (!recorder || recorder.state !== 'recording') return

    if (recordTimeoutRef.current) {
      window.clearTimeout(recordTimeoutRef.current)
      recordTimeoutRef.current = null
    }

    if (recordStartAtRef.current) {
      const elapsedMs = Date.now() - recordStartAtRef.current
      elapsedMsRef.current += elapsedMs
      remainingMsRef.current = Math.max(0, MAX_RECORDING_MS - elapsedMsRef.current)
    }

    recorder.pause()
    setIsPaused(true)
    recordStartAtRef.current = null
  }

  const resumeRecording = () => {
    if (!recorder || recorder.state !== 'paused') return

    recorder.resume()
    setIsPaused(false)
    recordStartAtRef.current = Date.now()
    recordTimeoutRef.current = window.setTimeout(() => {
      stopRecording()
    }, remainingMsRef.current)
  }

  const playRecordedAudio = () => {
    if (!recordedBlob) return false

    if (!audioRef.current) {
      audioRef.current = new Audio()
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
    }

    const audioUrl = URL.createObjectURL(recordedBlob)
    audioUrlRef.current = audioUrl
    audioRef.current.src = audioUrl
    audioRef.current.play().catch(() => {})
    return true
  }

  const stopRecordingAndGetBlob = async () => {
    if (!recorder || recorder.state === 'inactive') {
      return recordedBlob
    }

    return new Promise<Blob | null>((resolve) => {
      stopResolveRef.current = resolve
      stopRecording()
    })
  }

  const getDurationSeconds = () => elapsedSeconds

  return {
    isRecording,
    isPaused,
    elapsedSeconds,
    micPermissionState,
    isMicAlertOpen,
    setIsMicAlertOpen,
    recordedBlob,
    playRecordedAudio,
    startRecording,
    stopRecordingAndGetBlob,
    getDurationSeconds,
    pauseRecording,
    resumeRecording,
    stopRecording,
  }
}
