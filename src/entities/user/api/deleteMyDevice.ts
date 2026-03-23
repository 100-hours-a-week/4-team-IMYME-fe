import axios from 'axios'

import { proxyApiClient } from '@/shared/api'

type DeleteMyDeviceResult = { ok: true } | { ok: false; reason: string }

const HTTP_STATUS_NO_CONTENT = 204
const HTTP_STATUS_UNAUTHORIZED = 401
const HTTP_STATUS_NOT_FOUND = 404
const EMPTY_DEVICE_UUID_REASON = 'empty_device_uuid'
const UNAUTHORIZED_REASON = 'unauthorized'
const NOT_FOUND_REASON = 'not_found'
const UNEXPECTED_STATUS_REASON = 'unexpected_status'
const REQUEST_FAILED_REASON = 'request_failed'

export async function deleteMyDevice(deviceUuid: string): Promise<DeleteMyDeviceResult> {
  if (!deviceUuid) {
    return { ok: false, reason: EMPTY_DEVICE_UUID_REASON }
  }

  try {
    const response = await proxyApiClient.delete(`/proxy-api/users/me/devices/${deviceUuid}`)

    if (response.status === HTTP_STATUS_NO_CONTENT) {
      return { ok: true }
    }

    return { ok: false, reason: UNEXPECTED_STATUS_REASON }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status

      if (statusCode === HTTP_STATUS_UNAUTHORIZED) {
        return { ok: false, reason: UNAUTHORIZED_REASON }
      }

      if (statusCode === HTTP_STATUS_NOT_FOUND) {
        return { ok: false, reason: NOT_FOUND_REASON }
      }
    }

    console.error('Failed to delete my device', error)
    return { ok: false, reason: REQUEST_FAILED_REASON }
  }
}
