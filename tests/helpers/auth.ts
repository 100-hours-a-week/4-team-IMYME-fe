import { createUuidForRegex } from '@/shared'

import type { Page } from '@playwright/test'

const E2E_LOGIN_PATH = '/api/e2e/login'
const DEFAULT_E2E_BASE_URL = 'http://localhost:3000'

// deviceUuid를 env로 빼두면 CI에서도 편합니다.

export async function loginByE2EApi(params: { page: Page; baseURL?: string }) {
  const { page, baseURL } = params

  const deviceUuid = createUuidForRegex()

  const resolvedBaseUrl = baseURL ?? process.env.E2E_BASE_URL ?? DEFAULT_E2E_BASE_URL
  const url = new URL(E2E_LOGIN_PATH, resolvedBaseUrl).toString()

  // ✅ page.request는 page/context와 쿠키 저장소를 공유
  const res = await page.request.post(url, { data: { deviceUuid } })

  if (!res.ok()) {
    // baseURL 문제를 빠르게 확인할 수 있게 로그 포함
    throw new Error(`E2E login failed: ${res.status()} ${res.statusText()} (url: ${url})`)
  }
}
