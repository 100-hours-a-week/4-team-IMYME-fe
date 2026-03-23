'use client'

// Firebase 앱 초기화 관련 API
import { getApp, getApps, initializeApp } from 'firebase/app'
// Firebase Cloud Messaging 관련 API
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type MessagePayload,
  type Messaging,
} from 'firebase/messaging'

// FCM 전용 Service Worker 경로(public/* 하위)
const FCM_SW_PATH = '/firebase-messaging-sw.js'
const FIREBASE_API_KEY_QUERY_PARAM = 'firebaseApiKey'
const FIREBASE_AUTH_DOMAIN_QUERY_PARAM = 'firebaseAuthDomain'
const FIREBASE_PROJECT_ID_QUERY_PARAM = 'firebaseProjectId'
const FIREBASE_STORAGE_BUCKET_QUERY_PARAM = 'firebaseStorageBucket'
const FIREBASE_MESSAGING_SENDER_ID_QUERY_PARAM = 'firebaseMessagingSenderId'
const FIREBASE_APP_ID_QUERY_PARAM = 'firebaseAppId'
const FIREBASE_MEASUREMENT_ID_QUERY_PARAM = 'firebaseMeasurementId'

// 클라이언트 공개 환경변수로 구성하는 Firebase 앱 설정
const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// 웹 푸시 토큰 발급 시 필요한 VAPID 공개키
const FIREBASE_VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
const EXPECTED_VAPID_KEY_LENGTH = 87
const VAPID_KEY_PATTERN = /^[A-Za-z0-9_-]+$/

// 최소 필수 설정이 있는지 확인 (없으면 초기화/요청을 중단)
const hasRequiredFirebaseConfig = () =>
  Boolean(
    FIREBASE_CONFIG.apiKey &&
    FIREBASE_CONFIG.projectId &&
    FIREBASE_CONFIG.messagingSenderId &&
    FIREBASE_CONFIG.appId &&
    FIREBASE_VAPID_KEY,
  )

type VapidKeyValidationResult =
  | { ok: true; key: string }
  | { ok: false; reason: string; length: number }

const validateVapidKey = (rawKey: string | undefined): VapidKeyValidationResult => {
  const normalizedKey = rawKey?.trim().replace(/\s+/g, '') ?? ''

  if (!normalizedKey) {
    return { ok: false, reason: 'missing_vapid_key', length: 0 }
  }

  if (!VAPID_KEY_PATTERN.test(normalizedKey)) {
    return { ok: false, reason: 'invalid_vapid_key_chars', length: normalizedKey.length }
  }

  if (normalizedKey.length !== EXPECTED_VAPID_KEY_LENGTH) {
    return { ok: false, reason: 'invalid_vapid_key_length', length: normalizedKey.length }
  }

  try {
    const base64Key = normalizedKey.replace(/-/g, '+').replace(/_/g, '/')
    const requiredPaddingLength = (4 - (base64Key.length % 4)) % 4
    const paddedBase64Key = `${base64Key}${'='.repeat(requiredPaddingLength)}`
    window.atob(paddedBase64Key)
  } catch {
    return { ok: false, reason: 'invalid_vapid_key_encoding', length: normalizedKey.length }
  }

  return { ok: true, key: normalizedKey }
}

// Firebase 앱 중복 초기화를 방지하는 헬퍼
const getFirebaseApp = () => (getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG))

const setOptionalSearchParameter = (url: URL, key: string, value: string | undefined) => {
  if (!value) {
    return
  }

  url.searchParams.set(key, value)
}

const buildFirebaseMessagingServiceWorkerUrl = () => {
  const serviceWorkerUrl = new URL(FCM_SW_PATH, window.location.origin)

  setOptionalSearchParameter(serviceWorkerUrl, FIREBASE_API_KEY_QUERY_PARAM, FIREBASE_CONFIG.apiKey)
  setOptionalSearchParameter(
    serviceWorkerUrl,
    FIREBASE_AUTH_DOMAIN_QUERY_PARAM,
    FIREBASE_CONFIG.authDomain,
  )
  setOptionalSearchParameter(
    serviceWorkerUrl,
    FIREBASE_PROJECT_ID_QUERY_PARAM,
    FIREBASE_CONFIG.projectId,
  )
  setOptionalSearchParameter(
    serviceWorkerUrl,
    FIREBASE_STORAGE_BUCKET_QUERY_PARAM,
    FIREBASE_CONFIG.storageBucket,
  )
  setOptionalSearchParameter(
    serviceWorkerUrl,
    FIREBASE_MESSAGING_SENDER_ID_QUERY_PARAM,
    FIREBASE_CONFIG.messagingSenderId,
  )
  setOptionalSearchParameter(serviceWorkerUrl, FIREBASE_APP_ID_QUERY_PARAM, FIREBASE_CONFIG.appId)
  setOptionalSearchParameter(
    serviceWorkerUrl,
    FIREBASE_MEASUREMENT_ID_QUERY_PARAM,
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  )

  return serviceWorkerUrl.toString()
}

// 오프라인 캐싱/백그라운드 알림용 SW를 등록하는 헬퍼
export const registerFirebaseMessagingServiceWorker = async () => {
  if (typeof window === 'undefined') {
    return null
  }

  if (!('serviceWorker' in navigator)) {
    console.warn('[sw] Service Worker API is not available')
    return null
  }

  try {
    const serviceWorkerUrl = buildFirebaseMessagingServiceWorkerUrl()
    return await navigator.serviceWorker.register(serviceWorkerUrl)
  } catch (error) {
    console.error('[sw] failed to register service worker', error)
    return null
  }
}

// 현재 브라우저/환경에서 안전하게 Messaging 인스턴스를 가져오는 헬퍼
const getMessagingSafe = async (): Promise<Messaging | null> => {
  // SSR 환경에서는 브라우저 API가 없으므로 중단
  if (typeof window === 'undefined') {
    console.warn('[fcm] window is undefined')
    return null
  }
  // 설정 누락 시 중단
  if (!hasRequiredFirebaseConfig()) {
    console.warn('[fcm] firebase config is missing')
    return null
  }

  // 해당 브라우저가 FCM(Web Push)을 지원하는지 확인
  const supported = await isSupported()
  if (!supported) {
    console.warn('[fcm] browser does not support firebase messaging')
    return null
  }

  // 지원되는 경우 Messaging 인스턴스 반환
  return getMessaging(getFirebaseApp())
}

// 알림 권한 요청 + FCM 토큰 발급(서비스워커 등록 포함)
export const requestFcmPermissionAndToken = async () => {
  // SSR 방어
  if (typeof window === 'undefined') {
    console.warn('[fcm] request token in non-browser environment')
    return null
  }
  // Notification API 미지원 브라우저 방어
  if (!('Notification' in window)) {
    console.warn('[fcm] Notification API is not available')
    return null
  }

  // 이미 허용/거부된 경우 기존 값을 재사용하고, 미결정(default)일 때만 권한 팝업
  const currentPermission = Notification.permission
  const nextPermission =
    currentPermission === 'default' ? await Notification.requestPermission() : currentPermission

  // 권한이 허용되지 않으면 토큰 발급 중단
  if (nextPermission !== 'granted') {
    console.warn('[fcm] notification permission is not granted', {
      currentPermission,
      nextPermission,
    })
    return null
  }

  // Messaging 인스턴스 확보
  const messaging = await getMessagingSafe()
  if (!messaging) {
    console.warn('[fcm] messaging instance is unavailable')
    return null
  }

  try {
    // FCM 백그라운드 수신을 위한 서비스워커 등록
    const serviceWorkerRegistration = await registerFirebaseMessagingServiceWorker()
    if (!serviceWorkerRegistration) {
      console.warn('[fcm] service worker registration is unavailable')
      return null
    }

    const vapidKeyValidationResult = validateVapidKey(FIREBASE_VAPID_KEY)
    if (!vapidKeyValidationResult.ok) {
      console.error('[fcm] invalid vapid key', {
        reason: vapidKeyValidationResult.reason,
        length: vapidKeyValidationResult.length,
      })
      return null
    }

    // 서비스워커/키 정보를 함께 전달해 FCM 토큰 발급
    const token = await getToken(messaging, {
      vapidKey: vapidKeyValidationResult.key,
      serviceWorkerRegistration,
    })

    if (!token) {
      console.warn('[fcm] getToken returned empty token')
      return null
    }

    return token
  } catch (error) {
    console.error('[fcm] failed to issue token', error)
    return null
  }
}

// 포그라운드 메시지 수신 구독 함수 (해제 함수 반환)
export const subscribeForegroundMessage = async (
  onForegroundMessage: (payload: MessagePayload) => void,
) => {
  // Messaging 인스턴스 확보
  const messaging = await getMessagingSafe()
  // 미지원 환경이면 no-op unsubscribe 반환
  if (!messaging) return () => {}

  // foreground 수신 구독 등록 (반환값은 unsubscribe 함수)
  return onMessage(messaging, onForegroundMessage)
}
