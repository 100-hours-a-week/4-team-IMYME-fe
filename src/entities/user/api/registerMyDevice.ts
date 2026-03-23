import { proxyApiClient } from '@/shared/api'

type RegisterMyDevicePayload = {
  deviceUuid: string
  fcmToken: string
  agentType: string
  platformType: string
  isStandalone: boolean
  isPushEnabled: boolean
}

type RegisterMyDeviceResult = { ok: true } | { ok: false; reason: string }

export async function registerMyDevice(
  payload: RegisterMyDevicePayload,
): Promise<RegisterMyDeviceResult> {
  try {
    await proxyApiClient.post('/proxy-api/users/me/devices', payload, {
      headers: { 'Content-Type': 'application/json' },
    })
    return { ok: true }
  } catch (error) {
    console.error('Failed to register my device', error)
    return { ok: false, reason: 'request_failed' }
  }
}
