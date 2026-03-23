'use client'

import { type MessagePayload } from 'firebase/messaging'
import { useEffect } from 'react'
import { toast } from 'sonner'

import {
  registerFirebaseMessagingServiceWorker,
  subscribeForegroundMessage,
} from '@/shared/lib/firebaseMessagingClient'

// 환경변수로 FCM 기능 전체 on/off 제어
const ENABLE_FCM = process.env.NEXT_PUBLIC_ENABLE_FCM
const DEFAULT_NOTIFICATION_TITLE = 'MINE'
const DEFAULT_NOTIFICATION_PATH = '/main'
const OPEN_NOTIFICATION_ACTION_LABEL = '열기'
const FCM_DEBUG_PREFIX = '[fcm-debug]'
const LAST_FCM_RECEIVED_AT_STORAGE_KEY = 'last_fcm_received_at'
const LAST_FCM_RECEIVED_SOURCE_STORAGE_KEY = 'last_fcm_received_source'
const LAST_FCM_PAYLOAD_STORAGE_KEY = 'last_fcm_payload'
const BACKGROUND_RECEIVED_MESSAGE_TYPE = 'fcm_background_received'

type ForegroundNotificationPayload = {
  title: string
  content: string
  path: string
}

const resolveForegroundNotificationPayload = (
  payload: MessagePayload,
): ForegroundNotificationPayload => {
  const data = payload.data ?? {}

  const title = data.title?.trim() || payload.notification?.title || DEFAULT_NOTIFICATION_TITLE
  const content = data.content?.trim() || payload.notification?.body || ''
  const path = data.path?.trim() || DEFAULT_NOTIFICATION_PATH

  return { title, content, path }
}

const navigateToNotificationPath = (path: string) => {
  const targetUrl = new URL(path, window.location.origin).toString()
  window.location.assign(targetUrl)
}

const persistLastFcmReceived = (params: {
  source: 'foreground' | 'background'
  payload: unknown
  receivedAt?: string
}) => {
  const receivedAt = params.receivedAt ?? new Date().toISOString()

  localStorage.setItem(LAST_FCM_RECEIVED_AT_STORAGE_KEY, receivedAt)
  localStorage.setItem(LAST_FCM_RECEIVED_SOURCE_STORAGE_KEY, params.source)
  localStorage.setItem(LAST_FCM_PAYLOAD_STORAGE_KEY, JSON.stringify(params.payload))
}

export function FirebaseMessagingBootstrap() {
  useEffect(() => {
    // 알림 권한과 무관하게 SW를 먼저 등록해 오프라인 캐싱을 활성화합니다.
    void registerFirebaseMessagingServiceWorker()
  }, [])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return
    }

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type !== BACKGROUND_RECEIVED_MESSAGE_TYPE) {
        return
      }

      console.info(`${FCM_DEBUG_PREFIX} background message received`, event.data)
      persistLastFcmReceived({
        source: 'background',
        payload: event.data.payload,
        receivedAt: event.data.receivedAt,
      })
    }

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage)
    }
  }, [])

  useEffect(() => {
    // FCM 비활성 환경에서는 초기화하지 않음
    if (!ENABLE_FCM) return

    // foreground 구독 해제 함수를 effect cleanup에서 사용
    let unsubscribe = () => {}

    // 앱 시작 시 1회 실행되는 FCM foreground 구독 초기화 루틴
    // 토큰 발급/디바이스 등록은 로그인 콜백(KakaoCallbackPage)에서 수행한다.
    const initializeFirebaseMessaging = async () => {
      // 앱 foreground 상태 메시지 구독
      unsubscribe = await subscribeForegroundMessage((payload) => {
        console.info(`${FCM_DEBUG_PREFIX} foreground message received`, payload)
        persistLastFcmReceived({ source: 'foreground', payload })

        const { title, content, path } = resolveForegroundNotificationPayload(payload)

        toast.info(title, {
          description: content,
          action: {
            label: OPEN_NOTIFICATION_ACTION_LABEL,
            onClick: () => {
              navigateToNotificationPath(path)
            },
          },
        })
      })
    }

    // 비동기 초기화 실행
    void initializeFirebaseMessaging()

    // 언마운트 시 foreground 수신 구독 해제
    return () => {
      unsubscribe()
    }
  }, [])

  return null
}
