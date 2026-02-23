import { test, expect } from '@playwright/test'

import { loginByE2EApi } from '../helpers/auth'

test('보호 라우트 /main 접근', async ({ page, baseURL }) => {
  if (!baseURL) throw new Error('baseURL is not set in Playwright config')

  await loginByE2EApi({ page, baseURL })

  await page.goto('/main', { waitUntil: 'load' })
  await expect(page).toHaveURL(/\/main/)
})
