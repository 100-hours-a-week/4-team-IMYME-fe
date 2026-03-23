'use client'

import { useCallback, useEffect, useRef } from 'react'

import { useStompClient } from '@/shared/lib/useStompClient'

import { parsePvpSocketMessage } from './pvpSocketMessage'

import type { PvpSocketMessage } from './pvpSocketMessage'
import type { IMessage, StompSubscription } from '@stomp/stompjs'

const REGISTER_SESSION_ACTION = 'register-session'

const APP_DESTINATION_PREFIX = '/app/pvp'
const TOPIC_DESTINATION_PREFIX = '/topic/pvp'
const EMPTY_BODY = '{}'

type UsePvPRoomTopicSocketParams = {
  accessToken: string | null
  roomId: number | null
  onTopicMessage: (message: PvpSocketMessage) => void
}

// 공통 room topic 소켓 훅 반환 타입
type UsePvPRoomTopicSocketResult = {
  cleanupConnection: () => Promise<void>
  publishRoomAction: (roomId: number, action: string, body?: string) => boolean
}

export function usePvPRoomTopicSocket({
  accessToken,
  roomId,
  onTopicMessage,
}: UsePvPRoomTopicSocketParams): UsePvPRoomTopicSocketResult {
  // onConnect/메시지 콜백에서 현재 roomId를 참조하기 위한 ref
  const roomIdRef = useRef<number | null>(null)
  // 현재 topic 구독 객체 (재구독/정리용)
  const topicSubscriptionRef = useRef<StompSubscription | null>(null)
  // 최신 onTopicMessage 콜백을 유지해 stale closure를 방지한다.
  const onTopicMessageRef = useRef(onTopicMessage)

  // 콜백이 바뀌면 ref를 최신값으로 업데이트
  useEffect(() => {
    onTopicMessageRef.current = onTopicMessage
  }, [onTopicMessage])

  // STOMP 연결/발행/구독 공통 훅
  const {
    connect: connectSocket,
    disconnect: disconnectSocket,
    // destination 발행 함수
    publish: publishSocketMessage,
    // topic 구독 함수
    subscribe: subscribeTopic,
  } = useStompClient({
    accessToken,
    autoConnect: false,
    onConnect: () => {
      // 연결 시점의 roomId를 ref에서 읽는다.
      const currentRoomId = roomIdRef.current
      // roomId가 없으면 구독/등록을 진행하지 않는다.
      if (!currentRoomId) return

      // 재연결 시 중복 구독을 막기 위해 기존 구독을 먼저 해제
      topicSubscriptionRef.current?.unsubscribe()
      // /topic/pvp/{roomId} 구독
      topicSubscriptionRef.current = subscribeTopic(
        `${TOPIC_DESTINATION_PREFIX}/${currentRoomId}`,
        (message: IMessage) => {
          let parsedMessage: unknown

          // 문자열 body를 JSON으로 파싱 (실패하면 무시)
          try {
            parsedMessage = JSON.parse(message.body)
          } catch {
            return
          }

          // 공통 파서로 shape 검증/정규화
          const socketMessage = parsePvpSocketMessage(parsedMessage)
          if (!socketMessage) return
          // 다른 방 메시지는 무시
          if (socketMessage.roomId !== currentRoomId) return

          // 유효 메시지를 상위 콜백으로 전달
          onTopicMessageRef.current(socketMessage)
        },
      )

      // 구독 성공 직후 세션 등록 이벤트를 전송
      publishSocketMessage(
        `${APP_DESTINATION_PREFIX}/${currentRoomId}/${REGISTER_SESSION_ACTION}`,
        EMPTY_BODY,
      )
    },
  })

  // room action 전송 helper (/app/pvp/{roomId}/{action})
  const publishRoomAction: UsePvPRoomTopicSocketResult['publishRoomAction'] = useCallback(
    (targetRoomId, action, body = EMPTY_BODY) =>
      publishSocketMessage(`${APP_DESTINATION_PREFIX}/${targetRoomId}/${action}`, body),
    [publishSocketMessage],
  )

  // 구독/연결 정리 함수
  const cleanupConnection = useCallback(async () => {
    // 먼저 topic 구독 해제
    topicSubscriptionRef.current?.unsubscribe()
    topicSubscriptionRef.current = null
    // 현재 room ref 초기화
    roomIdRef.current = null
    // 마지막으로 STOMP 연결 종료
    await disconnectSocket()
  }, [disconnectSocket])

  useEffect(() => {
    // ref를 최신 roomId로 갱신
    roomIdRef.current = roomId
    // roomId가 없으면 연결하지 않음
    if (!roomId) return

    // roomId가 있으면 소켓 연결
    connectSocket()
  }, [connectSocket, roomId])

  // 훅 unmount 시 연결 정리
  useEffect(() => {
    return () => {
      void cleanupConnection()
    }
  }, [cleanupConnection])

  return {
    cleanupConnection,
    publishRoomAction,
  }
}
