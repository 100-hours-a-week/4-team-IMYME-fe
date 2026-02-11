// Playwright 테스트 베이스 + chromium 타입/런처
import { test as base, chromium, type Browser } from '@playwright/test'
// 충돌 없는 포트 할당 유틸
import getPort from 'get-port'
// Lighthouse 실행 헬퍼
import { playAudit } from 'playwright-lighthouse'

// worker 스코프에서 공유할 fixture 타입
type WorkerFixtures = {
  // Lighthouse 디버깅 포트
  port: number
  // Lighthouse용 chromium 인스턴스
  lhBrowser: Browser
}

// worker fixtures 확장
const test = base.extend<object, WorkerFixtures>({
  // ✅ worker fixture로 선언 (두 번째 제네릭에 들어있어서 scope:'worker' 가능)
  // 포트 fixture 정의
  port: [
    // worker 시작 시 실행
    async ({}, use) => {
      // 사용 가능한 포트 할당
      await use(await getPort())
    },
    // 워커당 1회만 생성
    { scope: 'worker' },
  ],

  // ✅ Lighthouse 전용 브라우저를 따로 띄워서 remote debugging port를 확실히 맞춤
  // 브라우저 fixture 정의
  lhBrowser: [
    // port fixture 주입
    async ({ port }, use) => {
      // 디버깅 포트 고정
      const browser = await chromium.launch({
        // Lighthouse가 접속할 포트
        args: [`--remote-debugging-port=${port}`],
      })
      // 테스트 본문에 브라우저 전달
      await use(browser)
      // 종료 정리
      await browser.close()
    },
    // 워커당 1회만 생성
    { scope: 'worker' },
  ],
})

// Lighthouse 성능 게이트 테스트
test('Home Lighthouse gate', async ({ lhBrowser, port, baseURL }) => {
  // Lighthouse용 페이지 생성
  const page = await lhBrowser.newPage()

  // 홈 진입 후 load까지 대기
  await page.goto(baseURL!, { waitUntil: 'load' })

  // Lighthouse 실행
  await playAudit({
    // 현재 페이지 대상
    page,
    // remote debugging 포트
    port,
    // 카테고리 기준
    thresholds: {
      // 성능 점수 최소
      performance: 80,
      // 접근성 점수 최소
      accessibility: 80,
      // 베스트 프랙티스 최소
      'best-practices': 80,
      // SEO 최소
      seo: 80,
    },
    // 리포트 저장 옵션
    reports: {
      // HTML/JSON 생성
      formats: { html: true, json: true },
      // 타임스탬프 기반 파일명
      name: `home-${Date.now()}`,
      // 저장 폴더
      directory: 'lighthouse',
    },
  })

  // 페이지 정리
  await page.close()
})
