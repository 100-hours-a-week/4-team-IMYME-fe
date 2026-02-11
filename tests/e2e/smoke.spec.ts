import { test, expect } from '@playwright/test'

test('홈 접근', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/login')
  await expect(page.getByText('MINE')).toBeVisible()
  await expect(page.getByRole('button', { name: '카카오로 시작하기' })).toBeVisible()
})
