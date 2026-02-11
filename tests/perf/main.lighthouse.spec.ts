import { test as base, chromium, type Browser, expect } from '@playwright/test'
import getPort from 'get-port'
import { playAudit } from 'playwright-lighthouse'

import { loginByE2EApi } from '../helpers/auth' // ✅ 보통 상대경로 권장

type WorkerFixtures = {
  port: number
  lhBrowser: Browser
}

const test = base.extend<object, WorkerFixtures>({
  port: [
    async ({}, use) => {
      await use(await getPort())
    },
    { scope: 'worker' },
  ],
  lhBrowser: [
    async ({ port }, use) => {
      const browser = await chromium.launch({
        args: [`--remote-debugging-port=${port}`],
      })
      await use(browser)
      await browser.close()
    },
    { scope: 'worker' },
  ],
})

test('Main Lighthouse gate', async ({ lhBrowser, port, baseURL }) => {
  if (!baseURL) throw new Error('baseURL is not set in Playwright config')

  const page = await lhBrowser.newPage()

  // ✅ 같은 origin 먼저 방문
  await page.goto(new URL('/', baseURL).toString(), { waitUntil: 'load' })

  // ✅ 로그인(= refresh_token 쿠키 Set-Cookie 받기)
  await loginByE2EApi({ page, baseURL })

  // ✅ 보호 라우트 진입
  await page.goto(new URL('/main', baseURL).toString(), { waitUntil: 'load' })
  await expect(page).toHaveURL(/\/main/)

  // ✅ (권장) 렌더 완료 기준이 있으면 가장 안정적
  // await expect(page.getByTestId('main-root')).toBeVisible()

  await playAudit({
    page,
    port,
    thresholds: {
      performance: 80,
      accessibility: 80,
      'best-practices': 80,
      seo: 80,
    },
    reports: {
      formats: { html: true, json: true },
      name: `main-${Date.now()}`,
      directory: 'lighthouse',
    },
  })

  await page.close()
})
