'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { deleteMyDevice, registerMyDevice } from '@/entities/user'
import { createUuidForRegex } from '@/shared/lib/createUuidForRegex'
import { requestFcmPermissionAndToken } from '@/shared/lib/firebaseMessagingClient'
import { Field, FieldLabel, FieldContent, FieldDescription } from '@/shared/ui/field'
import { Switch } from '@/shared/ui/switch'

const NOTIFICATION_SWITCH_ID = 'switch-focus-mode'
const NOTIFICATION_ON_MESSAGE = '알림이 켜졌습니다.'
const NOTIFICATION_OFF_MESSAGE = '알림이 꺼졌습니다.'
const NOTIFICATION_REGISTER_FAILED_MESSAGE = '알림 등록에 실패했습니다. 다시 시도해주세요.'
const NOTIFICATION_TOKEN_ISSUE_FAILED_MESSAGE = '알림 토큰 발급에 실패했습니다.'
const NOTIFICATION_DELETE_FAILED_MESSAGE = '알림 해제 요청에 실패했습니다.'
const DEVICE_UUID_STORAGE_KEY = 'device_uuid'
const FCM_TOKEN_STORAGE_KEY = 'fcm_token'
const PLATFORM_TYPE_MOBILE_WEB = 'MOBILE_WEB'
const PLATFORM_TYPE_DESKTOP_WEB = 'DESKTOP_WEB'
const AGENT_TYPE_CHROME = 'CHROME'
const AGENT_TYPE_SAFARI = 'SAFARI'
const AGENT_TYPE_SAMSUNG = 'SAMSUNG'
const AGENT_TYPE_OTHER = 'OTHER'
const DISPLAY_MODE_STANDALONE_QUERY = '(display-mode: standalone)'

const resolvePlatformType = (userAgent: string) => {
  const normalizedUserAgent = userAgent.toLowerCase()
  if (normalizedUserAgent.includes('android')) return PLATFORM_TYPE_MOBILE_WEB
  if (
    normalizedUserAgent.includes('iphone') ||
    normalizedUserAgent.includes('ipad') ||
    normalizedUserAgent.includes('ipod') ||
    normalizedUserAgent.includes('mobile')
  ) {
    return PLATFORM_TYPE_MOBILE_WEB
  }
  return PLATFORM_TYPE_DESKTOP_WEB
}

const resolveAgentType = (userAgent: string) => {
  const normalizedUserAgent = userAgent.toLowerCase()

  if (normalizedUserAgent.includes('samsungbrowser')) {
    return AGENT_TYPE_SAMSUNG
  }

  if (
    normalizedUserAgent.includes('chrome') ||
    normalizedUserAgent.includes('crios') ||
    normalizedUserAgent.includes('chromium')
  ) {
    return AGENT_TYPE_CHROME
  }

  if (normalizedUserAgent.includes('safari')) {
    return AGENT_TYPE_SAFARI
  }

  return AGENT_TYPE_OTHER
}

const readIsStandaloneMode = () => {
  if (typeof window === 'undefined') return false
  const isDisplayModeStandalone = window.matchMedia(DISPLAY_MODE_STANDALONE_QUERY).matches
  const isIosStandalone = Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  return isDisplayModeStandalone || isIosStandalone
}

const getOrCreateDeviceUuid = () => {
  const storedDeviceUuid = localStorage.getItem(DEVICE_UUID_STORAGE_KEY)
  if (storedDeviceUuid) return storedDeviceUuid

  const createdDeviceUuid = createUuidForRegex()
  if (!createdDeviceUuid) return null

  localStorage.setItem(DEVICE_UUID_STORAGE_KEY, createdDeviceUuid)
  return createdDeviceUuid
}

export function NotificationSettingField() {
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const storedFcmToken = localStorage.getItem(FCM_TOKEN_STORAGE_KEY)
    const hasGrantedPermission = Notification.permission === 'granted'

    setIsNotificationEnabled(Boolean(storedFcmToken) && hasGrantedPermission)
  }, [])

  const handleNotificationToggle = async (checked: boolean) => {
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      if (checked === false) {
        const storedDeviceUuid = localStorage.getItem(DEVICE_UUID_STORAGE_KEY)

        if (storedDeviceUuid) {
          const deleteResult = await deleteMyDevice(storedDeviceUuid)
          if (!deleteResult.ok) {
            toast.error(NOTIFICATION_DELETE_FAILED_MESSAGE)
          }
        }

        localStorage.removeItem(FCM_TOKEN_STORAGE_KEY)
        setIsNotificationEnabled(false)
        toast.info(NOTIFICATION_OFF_MESSAGE)
        return
      }

      const deviceUuid = getOrCreateDeviceUuid()
      if (!deviceUuid) {
        toast.error(NOTIFICATION_REGISTER_FAILED_MESSAGE)
        setIsNotificationEnabled(false)
        return
      }

      const storedFcmToken = localStorage.getItem(FCM_TOKEN_STORAGE_KEY)
      const fcmToken = storedFcmToken ?? (await requestFcmPermissionAndToken())
      if (!fcmToken) {
        toast.error(NOTIFICATION_TOKEN_ISSUE_FAILED_MESSAGE)
        setIsNotificationEnabled(false)
        return
      }

      if (!storedFcmToken) {
        localStorage.setItem(FCM_TOKEN_STORAGE_KEY, fcmToken)
      }

      const userAgent = navigator.userAgent || ''
      const agentType = resolveAgentType(userAgent)
      const platformType = resolvePlatformType(userAgent)
      const isStandalone = readIsStandaloneMode()
      const registerResult = await registerMyDevice({
        deviceUuid,
        fcmToken,
        agentType,
        platformType,
        isStandalone,
        isPushEnabled: Notification.permission === 'granted',
      })

      if (!registerResult.ok) {
        localStorage.removeItem(FCM_TOKEN_STORAGE_KEY)
        toast.error(NOTIFICATION_REGISTER_FAILED_MESSAGE)
        setIsNotificationEnabled(false)
        return
      }

      setIsNotificationEnabled(true)
      toast.info(NOTIFICATION_ON_MESSAGE)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex">
      <Field
        orientation="horizontal"
        className="max-w-sm"
      >
        <FieldContent>
          <FieldLabel
            htmlFor={NOTIFICATION_SWITCH_ID}
            className="text-primary"
          >
            알림 설정
          </FieldLabel>
          <FieldDescription></FieldDescription>
        </FieldContent>
        <Switch
          id={NOTIFICATION_SWITCH_ID}
          checked={isNotificationEnabled}
          disabled={isSubmitting}
          onCheckedChange={handleNotificationToggle}
        />
      </Field>
    </div>
  )
}
