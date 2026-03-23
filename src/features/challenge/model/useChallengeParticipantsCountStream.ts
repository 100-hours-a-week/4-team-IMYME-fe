'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { getChallengeParticipantsStream } from '../api/getChallengeParticipantsStream'

const PAGE_HIDE_EVENT_NAME = 'pagehide'
const PAGE_SHOW_EVENT_NAME = 'pageshow'
const BEFORE_UNLOAD_EVENT_NAME = 'beforeunload'

type UseChallengeParticipantsCountStreamParams = {
  challengeId: number | null
  initialParticipantCount: number | null
  shouldConnect: boolean
  shouldStop: boolean
}

type StreamParticipantCount = {
  challengeId: number
  count: number
}

export function useChallengeParticipantsCountStream({
  challengeId,
  initialParticipantCount,
  shouldConnect,
  shouldStop,
}: UseChallengeParticipantsCountStreamParams): number | null {
  const pathname = usePathname()
  const [streamParticipantCount, setStreamParticipantCount] =
    useState<StreamParticipantCount | null>(null)
  const [reconnectTrigger, setReconnectTrigger] = useState(0)
  const participantStreamRef = useRef<EventSource | null>(null)
  const hasStoppedParticipantStreamRef = useRef(false)
  const isChallengeDetailPath =
    challengeId !== null ? pathname === `/challenge/${challengeId}` : false
  const closeParticipantStream = useCallback(() => {
    const participantStream = participantStreamRef.current
    if (!participantStream) return

    participantStream.onopen = null
    participantStream.onerror = null
    participantStream.close()
    participantStreamRef.current = null
  }, [])

  useEffect(() => {
    // challengeId가 바뀌면 이전 녹음 중지 상태는 초기화한다.
    hasStoppedParticipantStreamRef.current = false
  }, [challengeId])

  useEffect(() => {
    if (!challengeId) return
    if (!shouldConnect) return
    if (!isChallengeDetailPath) return
    if (hasStoppedParticipantStreamRef.current) return
    if (participantStreamRef.current) return

    const streamResult = getChallengeParticipantsStream(
      { challengeId },
      {
        onCount: (nextCount) => {
          setStreamParticipantCount({ challengeId, count: nextCount })
        },
      },
    )

    if (!streamResult.ok) {
      return
    }

    participantStreamRef.current = streamResult.eventSource

    return () => {
      closeParticipantStream()
    }
  }, [challengeId, closeParticipantStream, isChallengeDetailPath, reconnectTrigger, shouldConnect])

  useEffect(() => {
    if (!shouldStop) return

    hasStoppedParticipantStreamRef.current = true
    closeParticipantStream()
  }, [closeParticipantStream, shouldStop])

  useEffect(() => {
    const handlePageLeave = () => {
      closeParticipantStream()
    }
    const handlePageShow = (event: PageTransitionEvent) => {
      // bfcache에서 복원된 경우, 이미 닫힌 SSE를 다시 연결하도록 트리거한다.
      if (!event.persisted) return
      setReconnectTrigger((prev) => prev + 1)
    }

    window.addEventListener(PAGE_HIDE_EVENT_NAME, handlePageLeave)
    window.addEventListener(BEFORE_UNLOAD_EVENT_NAME, handlePageLeave)
    window.addEventListener(PAGE_SHOW_EVENT_NAME, handlePageShow)

    return () => {
      window.removeEventListener(PAGE_HIDE_EVENT_NAME, handlePageLeave)
      window.removeEventListener(BEFORE_UNLOAD_EVENT_NAME, handlePageLeave)
      window.removeEventListener(PAGE_SHOW_EVENT_NAME, handlePageShow)
      closeParticipantStream()
    }
  }, [closeParticipantStream])

  useEffect(() => {
    return () => {
      closeParticipantStream()
    }
  }, [closeParticipantStream, pathname])

  if (streamParticipantCount?.challengeId === challengeId) {
    return streamParticipantCount.count
  }

  return initialParticipantCount
}
