import { httpClient } from '@/shared'

type LogoutResult = { ok: true } | { ok: false; reason: string }

export async function logout(
  accessToken: string | null,
  deviceUuid: string | null,
): Promise<LogoutResult> {
  try {
    const response = await httpClient.post(
      '/auth/logout',
      {
        deviceUuid,
      },
      {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        },
      },
    )

    if (response.status !== 204) {
      return { ok: false, reason: 'unexpected_status' }
    }

    try {
      const clearResponse = await fetch('/api/auth/token/refresh/clear', { method: 'POST' })
      if (!clearResponse.ok) {
        return { ok: false, reason: 'refresh_clear_failed' }
      }
    } catch {
      return { ok: false, reason: 'refresh_clear_failed' }
    }

    return { ok: true }
  } catch {
    return { ok: false, reason: 'request_failed' }
  }
}
