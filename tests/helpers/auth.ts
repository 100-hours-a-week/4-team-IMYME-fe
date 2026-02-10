import type { Page } from '@playwright/test'

import { createUuidForRegex } from '@/shared/lib/createUuidForRegex'

const E2E_LOGIN_PATH = '/api/e2e/login'

// deviceUuid를 env로 빼두면 CI에서도 편합니다.

export async function loginByE2EApi(params: { page: Page; baseURL: string }) {
  const { page, baseURL } = params

  const deviceUuid = createUuidForRegex()

  const url = new URL(E2E_LOGIN_PATH, baseURL).toString()

  // ✅ page.request는 page/context와 쿠키 저장소를 공유
  const res = await page.request.post(url, { data: { deviceUuid } })

  if (!res.ok()) {
    throw new Error(`E2E login failed: ${res.status()} ${res.statusText()}`)
  }
}
