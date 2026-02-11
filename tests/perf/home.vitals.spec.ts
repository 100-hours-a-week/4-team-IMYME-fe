// Playwright 테스트 유틸
import { test, expect } from '@playwright/test'

// 브라우저에서 누적할 web-vitals 저장 구조
type PerfStore = {
  // Cumulative Layout Shift
  cls: number
  // Largest Contentful Paint (ms)
  lcp: number
  // First Contentful Paint (ms)
  fcp: number
}

// TTFB까지 포함한 결과 타입
type PerfResult = PerfStore & { ttfb: number }

// 홈 성능 예산 테스트
test('Home vitals budget', async ({ page }) => {
  // 페이지 로드 전 성능 측정 스크립트 삽입
  await page.addInitScript(() => {
    // window.__perf 초기화
    const w = window as unknown as { __perf?: PerfStore }
    // 기본값 설정
    w.__perf = { cls: 0, lcp: 0, fcp: 0 }

    // CLS
    try {
      // layout-shift 관찰자
      new PerformanceObserver((list) => {
        // 엔트리 순회
        for (const entry of list.getEntries()) {
          // layout-shift 엔트리만 들어온다고 가정 가능
          const ls = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean }
          // 사용자 입력 없는 shift만 포함
          if (!ls.hadRecentInput && typeof ls.value === 'number') {
            // CLS 누적
            w.__perf!.cls += ls.value
          }
        }
      }).observe({ type: 'layout-shift', buffered: true }) // 과거 엔트리 포함
    } catch {
      // 미지원 브라우저 대비
    }

    // LCP
    try {
      // LCP 관찰자
      new PerformanceObserver((list) => {
        // LCP 엔트리 목록
        const entries = list.getEntries()
        // 최신 LCP
        const last = entries[entries.length - 1]
        // 엔트리가 있으면
        if (last) {
          // 마지막 LCP 시간 기록
          w.__perf!.lcp = last.startTime
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true }) // 과거 엔트리 포함
    } catch {
      // 미지원 브라우저 대비
    }

    // FCP (paint observer에서 first-contentful-paint만 골라서)
    try {
      // paint 관찰자
      new PerformanceObserver((list) => {
        // 엔트리 순회
        for (const entry of list.getEntries()) {
          // FCP만 선택
          if (entry.name === 'first-contentful-paint') {
            // FCP 기록
            w.__perf!.fcp = entry.startTime
          }
        }
      }).observe({ type: 'paint', buffered: true }) // 과거 엔트리 포함
    } catch {
      // 미지원 브라우저 대비
    }
  })

  // 홈 진입 후 load까지 대기
  await page.goto('/', { waitUntil: 'load' })

  // 브라우저에서 측정값 수집
  const metrics = await page.evaluate((): PerfResult => {
    // 전역 저장소 접근
    const w = window as unknown as { __perf?: PerfStore }
    // 값 없으면 기본값
    const perf = w.__perf ?? { cls: 0, lcp: 0, fcp: 0 }

    // Navigation Timing 추출
    const nav = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined
    // TTFB 계산
    const ttfb = nav ? nav.responseStart - nav.requestStart : 0

    // 결과 합치기
    return { ...perf, ttfb }
  })

  // 예산값(환경변수 있으면 그걸 사용)
  const budget = {
    // CLS 허용치
    CLS: Number(process.env.BUDGET_CLS ?? 0.15),
    // LCP 허용치(ms)
    LCP_MS: Number(process.env.BUDGET_LCP_MS ?? 3500),
    // FCP 허용치(ms)
    FCP_MS: Number(process.env.BUDGET_FCP_MS ?? 2500),
    // TTFB 허용치(ms)
    TTFB_MS: Number(process.env.BUDGET_TTFB_MS ?? 800),
  }

  // CLS 예산 체크
  expect(metrics.cls).toBeLessThanOrEqual(budget.CLS)
  // LCP 예산 체크
  expect(metrics.lcp).toBeLessThanOrEqual(budget.LCP_MS)
  // FCP 예산 체크
  expect(metrics.fcp).toBeLessThanOrEqual(budget.FCP_MS)
  // TTFB 예산 체크
  expect(metrics.ttfb).toBeLessThanOrEqual(budget.TTFB_MS)

  // (선택) 값 로그로 확인하고 싶으면
  // console.log('[vitals]', metrics)
})
