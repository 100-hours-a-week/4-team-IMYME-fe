import { test, expect } from '@playwright/test'

import { loginByE2EApi } from '../helpers/auth'

type PerfStore = {
  cls: number
  lcp: number
  fcp: number
}

type PerfResult = PerfStore & { ttfb: number }

test('Main vitals budget', async ({ page, baseURL }) => {
  if (!baseURL) throw new Error('baseURL is not set in Playwright config')

  await page.addInitScript(() => {
    const w = window as unknown as { __perf?: PerfStore }
    w.__perf = { cls: 0, lcp: 0, fcp: 0 }

    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const ls = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean }
          if (!ls.hadRecentInput && typeof ls.value === 'number') {
            w.__perf!.cls += ls.value
          }
        }
      }).observe({ type: 'layout-shift', buffered: true })
    } catch {}

    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const last = entries[entries.length - 1]
        if (last) {
          w.__perf!.lcp = last.startTime
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true })
    } catch {}

    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            w.__perf!.fcp = entry.startTime
          }
        }
      }).observe({ type: 'paint', buffered: true })
    } catch {}
  })

  await page.goto(new URL('/', baseURL).toString(), { waitUntil: 'load' })
  await loginByE2EApi({ page, baseURL })
  await page.goto(new URL('/main', baseURL).toString(), { waitUntil: 'load' })

  const metrics = await page.evaluate((): PerfResult => {
    const w = window as unknown as { __perf?: PerfStore }
    const perf = w.__perf ?? { cls: 0, lcp: 0, fcp: 0 }

    const nav = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined
    const ttfb = nav ? nav.responseStart - nav.requestStart : 0

    return { ...perf, ttfb }
  })

  const budget = {
    CLS: Number(process.env.BUDGET_CLS ?? 0.15),
    LCP_MS: Number(process.env.BUDGET_LCP_MS ?? 3500),
    FCP_MS: Number(process.env.BUDGET_FCP_MS ?? 2500),
    TTFB_MS: Number(process.env.BUDGET_TTFB_MS ?? 800),
  }

  expect(metrics.cls).toBeLessThanOrEqual(budget.CLS)
  expect(metrics.lcp).toBeLessThanOrEqual(budget.LCP_MS)
  expect(metrics.fcp).toBeLessThanOrEqual(budget.FCP_MS)
  expect(metrics.ttfb).toBeLessThanOrEqual(budget.TTFB_MS)
})
