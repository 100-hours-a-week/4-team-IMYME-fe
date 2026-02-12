'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { startMediaRecorder } from '@/features/record'

// ✅ 최대 녹음 길이: 60초
const MAX_RECORDING_MS = 60_000

// ✅ elapsedSeconds 업데이트 주기(500ms마다 tick)
const TIMER_INTERVAL_MS = 500

// ✅ permissions API가 없거나 확인 불가하면 표시할 기본 상태
const DEFAULT_MIC_PERMISSION_STATE = 'unavailable'

type UseMicrophoneResult = {
  isRecording: boolean
  isPaused: boolean
  elapsedSeconds: number // 현재 녹음 경과(초) - UI 타이머 표시용
  recordedDurationSeconds: number // 최종 녹음 길이(초) - stop 시점에 확정
  micPermissionState: string // 권한 상태 문자열(permissions API 기반)
  isMicAlertOpen: boolean // 마이크 권한 안내 모달 open 상태
  setIsMicAlertOpen: (open: boolean) => void // 모달 open setter
  autoStopped: boolean // 최대 녹음 시간 초과로 자동 종료되었는지 여부
  resetAutoStopped: () => void // autoStopped 초기화
  recordedBlob: Blob | null // 녹음 완료 후 생성된 Blob
  startRecording: () => Promise<boolean> // 녹음 시작 (권한 확인 포함)
  stopRecordingAndGetBlob: () => Promise<Blob | null> // stop 후 blob 반환(비동기)
  getDurationSeconds: () => number // duration 계산(확정값 or 경과값)
  pauseRecording: () => void // 일시정지
  resumeRecording: () => void // 재개
  stopRecording: () => void // 정지(내부 구현은 isAutoStop 인자 받음)
  clearRecordedBlob: () => void // Blob 초기화
}

export function useMicrophone(): UseMicrophoneResult {
  // ✅ 녹음 UI 상태
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // ✅ UI에 표시할 타이머(초)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // ✅ 최종 녹음 길이(초) - stop 시점에 set
  const [recordedDurationSeconds, setRecordedDurationSeconds] = useState(0)

  // ✅ permissions API로 얻은 마이크 권한 상태
  const [micPermissionState, setMicPermissionState] = useState<string>(DEFAULT_MIC_PERMISSION_STATE)

  // ✅ 마이크 권한 안내 모달 상태
  const [isMicAlertOpen, setIsMicAlertOpen] = useState(false)

  // ✅ 최대 시간 초과로 stop 됐는지(UI에서 자동 업로드 같은 트리거에 사용)
  const [autoStopped, setAutoStopped] = useState(false)

  // ✅ 녹음 결과 Blob
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)

  // ✅ 실제 MediaRecorder 인스턴스(녹음 수행 엔진)
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null)

  // ✅ getUserMedia로 얻은 stream (stop 시 track stop 필요)
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null)

  // ✅ “최대 녹음 제한” 타이머 id 저장
  const recordTimeoutRef = useRef<number | null>(null)

  // ✅ elapsedSeconds를 업데이트하는 interval id 저장
  const elapsedIntervalRef = useRef<number | null>(null)

  // ✅ MediaRecorder에서 오는 chunk들을 모아두는 버퍼(BlobPart[])
  const chunksRef = useRef<BlobPart[]>([])

  // ✅ 현재 “녹음 시작 시각” 저장(일시정지/재개 타이머 계산용)
  const recordStartAtRef = useRef<number | null>(null)

  // ✅ 누적 녹음 시간(ms): pause/resume 사이 누적 시간 보존
  const elapsedMsRef = useRef<number>(0)

  // ✅ 재개 시 남은 시간(ms)
  const remainingMsRef = useRef<number>(MAX_RECORDING_MS)

  // ✅ stopRecordingAndGetBlob에서 onstop이 올 때 resolve 하기 위한 ref
  const stopResolveRef = useRef<((blob: Blob | null) => void) | null>(null)

  // ✅ 녹음 정지 함수(내부용). isAutoStop=true면 자동 종료 플래그를 세팅
  const stopRecording = useCallback(
    (isAutoStop = false) => {
      // ✅ “녹음 중”이었다면, 마지막 구간의 elapsedMs를 누적
      if (recordStartAtRef.current) {
        const elapsedMs = Date.now() - recordStartAtRef.current
        elapsedMsRef.current += elapsedMs
      }

      // ✅ 최종 duration(초) 확정 값 세팅(0 미만 방지)
      setRecordedDurationSeconds(Math.floor(Math.max(0, elapsedMsRef.current) / 1000))

      // ✅ autoStop 여부 반영
      setAutoStopped(isAutoStop)

      // ✅ 최대 제한 timeout 정리
      if (recordTimeoutRef.current) {
        window.clearTimeout(recordTimeoutRef.current)
        recordTimeoutRef.current = null
      }

      // ✅ recorder가 활성 상태면 stop 호출
      if (recorder && recorder.state !== 'inactive') {
        try {
          recorder.stop() // ✅ 여기서 onstop 이벤트가 발생하며 Blob 생성 로직이 실행됨
        } catch {
          // ignore: recorder.stop 예외는 무시(브라우저/상태 경쟁)
        }
      }

      // ✅ stream 트랙 종료(마이크 리소스 반환)
      if (recordingStream) {
        recordingStream.getTracks().forEach((track) => track.stop())
      }

      // ✅ 내부 상태 리셋
      setRecorder(null)
      setRecordingStream(null)
      setIsRecording(false)
      setIsPaused(false)

      // ✅ 타이머 ref/상태 초기화
      recordStartAtRef.current = null
      elapsedMsRef.current = 0
      remainingMsRef.current = MAX_RECORDING_MS
      setElapsedSeconds(0)
    },
    [recorder, recordingStream], // ⚠️ state 의존으로 stopRecording 참조가 변할 수 있음(정리 포인트에서 개선 제안)
  )

  // ✅ 녹음 중 + 일시정지 아님 상태에서 elapsedSeconds 업데이트
  useEffect(() => {
    if (!isRecording || isPaused) return

    elapsedIntervalRef.current = window.setInterval(() => {
      if (!recordStartAtRef.current) return // ✅ start 시각이 없으면 계산 불가
      const elapsedMs = elapsedMsRef.current + (Date.now() - recordStartAtRef.current)

      // ✅ 최대 시간 초과면 자동 종료 처리
      if (elapsedMs >= MAX_RECORDING_MS) {
        stopRecording(true)
        return
      }

      // ✅ UI 표시용 경과초 업데이트
      setElapsedSeconds(Math.floor(Math.max(0, elapsedMs) / 1000))
    }, TIMER_INTERVAL_MS)

    // ✅ cleanup: interval 제거
    return () => {
      if (elapsedIntervalRef.current) {
        window.clearInterval(elapsedIntervalRef.current)
        elapsedIntervalRef.current = null
      }
    }
  }, [isPaused, isRecording, stopRecording])

  // ✅ 언마운트 시 리소스 정리(타임아웃/오디오 URL/스트림 트랙)
  useEffect(() => {
    return () => {
      if (recordTimeoutRef.current) {
        window.clearTimeout(recordTimeoutRef.current)
      }
      if (recordingStream) {
        recordingStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [recordingStream])

  // ✅ permissions API로 마이크 권한 상태 확인(지원 안 하면 unavailable)
  const checkPermission = async () => {
    if (typeof window === 'undefined') return false // ✅ SSR 방어
    if (!navigator.permissions?.query) {
      setMicPermissionState(DEFAULT_MIC_PERMISSION_STATE)
      return false
    }

    try {
      const status = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      setMicPermissionState(status.state)

      // ✅ denied면 UI 모달 오픈 + false 반환
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

  // ✅ 실제 권한 요청(getUserMedia). 성공하면 브라우저가 권한 부여
  const requestPermission = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicPermissionState(DEFAULT_MIC_PERMISSION_STATE)
      return false
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())

      return true
    } catch {
      setIsMicAlertOpen(true)
      return false
    }
  }

  // ✅ 녹음 시작 플로우
  const startRecording = async () => {
    // 1) 권한 상태 확인(denied면 모달)
    const canCheck = await checkPermission()
    if (!canCheck) return false

    // 2) 실제 권한 요청(getUserMedia) - 거부 시 모달
    const hasPermission = await requestPermission()
    if (!hasPermission) return false

    // 3) 이미 녹음 중이면 stop하고 false 반환(“토글 시작” 방지용)
    if (isRecording) {
      stopRecording(false)
      return false
    }

    // 4) MediaRecorder/Stream 생성(프로젝트 유틸)
    const startResult = await startMediaRecorder()
    if (!startResult.ok) {
      setIsMicAlertOpen(true)
      return false
    }

    // 5) chunk 버퍼/상태 초기화
    chunksRef.current = []
    setRecordedBlob(null)
    setRecordedDurationSeconds(0)

    // 6) 데이터 chunk 수집 핸들러
    startResult.recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }

    // 7) stop 이벤트에서 Blob 생성 + recordedBlob 상태 반영 + stopRecordingAndGetBlob의 Promise resolve
    startResult.recorder.onstop = () => {
      const hasChunks = chunksRef.current.length > 0
      const blob = hasChunks
        ? new Blob(chunksRef.current, { type: startResult.recorder.mimeType })
        : null

      if (blob) {
        setRecordedBlob(blob)
      }

      // ✅ 버퍼 비움
      chunksRef.current = []

      // ✅ stopRecordingAndGetBlob에서 기다리고 있던 resolve 처리
      if (stopResolveRef.current) {
        const resolve = stopResolveRef.current
        stopResolveRef.current = null
        resolve(blob)
      }
    }

    // 8) recorder/stream 상태 저장
    setRecorder(startResult.recorder)
    setRecordingStream(startResult.stream)

    // 9) UI 상태 초기화 및 시작 시각 기록
    setIsRecording(true)
    setIsPaused(false)
    setAutoStopped(false)
    setRecordedDurationSeconds(0)

    recordStartAtRef.current = Date.now()
    elapsedMsRef.current = 0
    remainingMsRef.current = MAX_RECORDING_MS
    setElapsedSeconds(0)

    // 10) 최대 녹음 제한 timeout 설정
    recordTimeoutRef.current = window.setTimeout(() => {
      stopRecording(true)
    }, MAX_RECORDING_MS)

    return true
  }

  // ✅ 일시정지: recorder.pause + 남은시간 계산 + timeout 제거
  const pauseRecording = () => {
    if (!recorder || recorder.state !== 'recording') return

    // ✅ 최대 제한 timeout 제거(일시정지 동안에는 흐르지 않게)
    if (recordTimeoutRef.current) {
      window.clearTimeout(recordTimeoutRef.current)
      recordTimeoutRef.current = null
    }

    // ✅ 지금까지 경과한 시간을 누적하고 remaining 계산
    if (recordStartAtRef.current) {
      const elapsedMs = Date.now() - recordStartAtRef.current
      elapsedMsRef.current += elapsedMs
      remainingMsRef.current = Math.max(0, MAX_RECORDING_MS - elapsedMsRef.current)
    }

    recorder.pause()
    setIsPaused(true)

    // ✅ 일시정지 상태에서는 startAt을 null로(추가 경과 계산 방지)
    recordStartAtRef.current = null
  }

  // ✅ 재개: recorder.resume + 남은 시간만큼 timeout 재설정
  const resumeRecording = () => {
    if (!recorder || recorder.state !== 'paused') return

    recorder.resume()
    setIsPaused(false)

    // ✅ 재개 시점 기록
    recordStartAtRef.current = Date.now()

    // ✅ 남은 시간만큼만 auto stop timeout 재설정
    recordTimeoutRef.current = window.setTimeout(() => {
      stopRecording(true)
    }, remainingMsRef.current)
  }

  // ✅ recordedBlob 초기화(UI에서 “다시 녹음” 같은 흐름에 사용)
  const clearRecordedBlob = () => {
    setRecordedBlob(null)
  }

  // ✅ stop 후 Blob을 “반환” 받고 싶을 때 사용(비동기)
  const stopRecordingAndGetBlob = async () => {
    // ✅ recorder가 없거나 inactive면 이미 stop 상태 → 현재 recordedBlob 반환
    if (!recorder || recorder.state === 'inactive') {
      return recordedBlob
    }

    // ✅ recorder.stop()은 onstop 이벤트가 async로 오므로 Promise로 감싼다
    return new Promise<Blob | null>((resolve) => {
      stopResolveRef.current = resolve // onstop에서 resolve 호출
      stopRecording(false) // 실제 stop 수행
    })
  }

  // ✅ duration 계산: stop 시 recordedDurationSeconds가 있으면 그걸 사용, 없으면 elapsedSeconds
  const getDurationSeconds = () =>
    recordedDurationSeconds > 0 ? recordedDurationSeconds : elapsedSeconds

  // ✅ autoStopped 플래그 초기화(컨트롤러에서 소비 후 reset)
  const resetAutoStopped = () => setAutoStopped(false)

  // ✅ 외부로 공개
  return {
    isRecording,
    isPaused,
    elapsedSeconds,
    recordedDurationSeconds,
    micPermissionState,
    isMicAlertOpen,
    setIsMicAlertOpen,
    autoStopped,
    resetAutoStopped,
    recordedBlob,
    startRecording,
    stopRecordingAndGetBlob,
    getDurationSeconds,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearRecordedBlob,
  }
}
