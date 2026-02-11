import { defineConfig, devices } from '@playwright/test'

// ✅ perf 서버 포트 (기본 3001)
// - E2E(dev, 3000)와 충돌을 피하려고 보통 perf는 별도 포트 사용
const port = Number(process.env.PERF_PORT ?? 3001)

// ✅ 성능 테스트 대상 URL
// - PERF_BASE_URL이 있으면(예: 스테이징/배포 URL) 그걸로 측정
// - 없으면 로컬에서 http://localhost:${port} 로 측정
const baseURL = process.env.PERF_BASE_URL ?? `http://localhost:${port}`

// ✅ 배포 URL로 성능 측정할 땐 로컬 서버를 띄울 필요가 없으니,
// PERF_BASE_URL이 없을 때만 webServer로 서버를 자동 실행
const shouldStartServer = !process.env.PERF_BASE_URL

export default defineConfig({
  testDir: './tests/perf',

  // ✅ perf는 Lighthouse/측정 작업이 무거워서 E2E보다 타임아웃을 넉넉히 잡는다.
  timeout: 120_000,

  // ✅ CI에서만 flaky 완화용 재시도
  retries: process.env.CI ? 1 : 0,

  // ✅ 성능 측정은 병렬 실행하면 변동성/충돌이 커질 수 있어 단일 워커 권장
  workers: 1,

  use: {
    baseURL,

    ...devices['Desktop Chrome'],

    // ✅ perf에서는 trace/video를 남기면 오히려 잡음/리소스 사용이 커져서 보통 끔
    trace: 'off',
    video: 'off',

    // ✅ 실패 케이스만 스크린샷 저장(최소한의 디버깅 자료)
    screenshot: 'only-on-failure',
  },

  // ✅ PERF_BASE_URL이 없을 때(로컬 perf 측정)
  // Playwright가 테스트 시작 전에 서버를 자동으로 띄우고, 준비되면 테스트를 시작
  webServer: shouldStartServer
    ? {
        // ✅ 성능 측정은 반드시 production 모드로:
        // next dev는 번들링/소스맵/HMR 등으로 성능이 왜곡될 수 있음
        command: `pnpm build && pnpm start -p ${port}`,
        url: baseURL,
        reuseExistingServer: true, // ✅ 이미 떠 있으면 재사용
        env: {
          ALLOW_E2E_LOGIN: 'true',
        },
      }
    : undefined,
})
