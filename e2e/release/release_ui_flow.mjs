import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'

import { chromium } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'https://release.imymemine.kr'
const E2E_LOGIN_PATH = process.env.E2E_LOGIN_PATH ?? '/api/e2e/login'
const BACKEND_E2E_LOGIN_PATH = process.env.BACKEND_E2E_LOGIN_PATH ?? '/server/e2e/login'
const DEVICE_UUID = process.env.DEVICE_UUID ?? randomUUID()
const HEADLESS = process.env.HEADLESS !== 'false'
const SLOW_MO = Number(process.env.SLOW_MO ?? '0')
const DEFAULT_TIMEOUT_MS = Number(process.env.DEFAULT_TIMEOUT_MS ?? '15000')
const FEEDBACK_TIMEOUT_MS = Number(process.env.FEEDBACK_TIMEOUT_MS ?? '180000')
const FEEDBACK_RESULT_TIMEOUT_MS = Number(process.env.FEEDBACK_RESULT_TIMEOUT_MS ?? '120000')
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS ?? '2000')
const PAUSE_ON_FEEDBACK = process.env.PAUSE_ON_FEEDBACK === 'true'
const FEEDBACK_PAUSE_MS = Number(process.env.FEEDBACK_PAUSE_MS ?? '60000')
const AUDIO_FILE =
  process.env.AUDIO_FILE ??
  '/Users/wonhyeonseob/Desktop/git/MINE/fe/4-team-IMYME-fe/playwright/release/assets/sample_speech.webm'
const DEFAULT_AUDIO_CONTENT_TYPE = 'audio/webm'
const E2E_ACCESS_TOKEN_FALLBACK_EXPIRES_IN_MS = 10 * 60 * 1000
const TERMINAL_STATUSES = new Set(['COMPLETED', 'FAILED', 'EXPIRED'])

function assertOk(condition, message) {
  if (!condition) throw new Error(message)
}

function resolveAccessTokenExpiresAtMs(rawValue) {
  const raw = Number(rawValue)
  if (!Number.isFinite(raw) || raw <= 0) {
    return Date.now() + E2E_ACCESS_TOKEN_FALLBACK_EXPIRES_IN_MS
  }
  // backend가 만료 시각(ms epoch) 또는 TTL(seconds)로 내려줄 수 있어 둘 다 허용
  if (raw > 10_000_000_000) {
    return raw
  }
  return Date.now() + raw * 1000
}

async function setAuthCookiesFromBackendLogin(context, data) {
  const accessToken = data?.accessToken
  const refreshToken = data?.refreshToken
  assertOk(accessToken && refreshToken, 'Missing tokens in backend e2e login response')

  const accessTokenExpiresAtMs = resolveAccessTokenExpiresAtMs(data?.expiresIn)
  const cookieBaseUrl = new URL(BASE_URL).origin
  await context.addCookies([
    { url: cookieBaseUrl, name: 'access_token', value: accessToken, httpOnly: true, sameSite: 'Lax' },
    {
      url: cookieBaseUrl,
      name: 'access_token_expires_at',
      value: String(accessTokenExpiresAtMs),
      httpOnly: true,
      sameSite: 'Lax',
    },
    { url: cookieBaseUrl, name: 'refresh_token', value: refreshToken, httpOnly: true, sameSite: 'Lax' },
    { url: cookieBaseUrl, name: 'e2e_access_token', value: accessToken, httpOnly: false, sameSite: 'Lax' },
    {
      url: cookieBaseUrl,
      name: 'e2e_access_token_expires_at',
      value: String(accessTokenExpiresAtMs),
      httpOnly: false,
      sameSite: 'Lax',
    },
  ])
}

async function e2eLogin(page, context) {
  const url = new URL(E2E_LOGIN_PATH, BASE_URL).toString()
  const response = await page.request.post(url, {
    data: { deviceUuid: DEVICE_UUID },
    headers: { 'Content-Type': 'application/json' },
  })

  if (response.ok()) {
    console.log(`[STEP 1] E2E login succeeded via ${E2E_LOGIN_PATH}`)
    return
  }

  const body = await response.text()
  const isBlockedByReleasePolicy = response.status() === 404 && body.includes('Not allowed')
  if (!isBlockedByReleasePolicy) {
    throw new Error(`E2E login failed: ${response.status()} ${response.statusText()} ${body}`)
  }

  const backendUrl = new URL(BACKEND_E2E_LOGIN_PATH, BASE_URL).toString()
  const backendResponse = await page.request.post(backendUrl, {
    data: { deviceUuid: DEVICE_UUID },
    headers: { 'Content-Type': 'application/json' },
  })
  assertOk(
    backendResponse.ok(),
    `Backend e2e login failed: ${backendResponse.status()} ${backendResponse.statusText()} ${await backendResponse.text()}`,
  )
  const backendBody = await backendResponse.json()
  await setAuthCookiesFromBackendLogin(context, backendBody?.data)
  console.log(`[STEP 1] ${E2E_LOGIN_PATH} blocked -> fallback login succeeded via ${BACKEND_E2E_LOGIN_PATH}`)
}

async function runMainChecks(page) {
  await page.goto(new URL('/main', BASE_URL).toString(), { waitUntil: 'domcontentloaded' })

  assertOk(page.url().includes('/main'), `Expected URL to include /main, got: ${page.url()}`)

  await page.getByAltText('profile image').waitFor({ state: 'visible' })
  await page.getByText('카드 수', { exact: true }).waitFor({ state: 'visible' })
  await page.getByText('승리', { exact: true }).waitFor({ state: 'visible' })
  await page.getByText('레벨', { exact: true }).waitFor({ state: 'visible' })
  await page.getByRole('button', { name: '레벨업 모드' }).waitFor({ state: 'visible' })
  await page.getByRole('button', { name: 'PVP 모드' }).waitFor({ state: 'visible' })
}

async function runPvpFlow(page) {
  await page.getByRole('button', { name: 'PVP 모드' }).click()
  await page.waitForURL(/\/pvp/)

  await page.getByText('매칭 입장하기', { exact: true }).waitFor({ state: 'visible' })
  await page.getByText('매칭 만들기', { exact: true }).waitFor({ state: 'visible' })
}

async function runLevelupFlow(page) {
  await page.goto(new URL('/main', BASE_URL).toString(), { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: '레벨업 모드' }).click()

  await page.waitForURL(/\/levelup(\?|$)/)
  await page.getByText('카테고리 선택', { exact: true }).waitFor({ state: 'visible' })

  const selectPanel = page.locator('div.bg-secondary.mx-4.rounded-2xl.p-4').first()
  await selectPanel.waitFor({ state: 'visible' })
  await clickFirstPanelButton(selectPanel, 'category', { skipTextPattern: /테스트/ })

  await page.getByText('키워드 선택', { exact: true }).waitFor({ state: 'visible' })

  await clickFirstPanelButton(selectPanel, 'keyword')

  await page.getByRole('heading', { name: '카드 만들기' }).waitFor({ state: 'visible' })

  const cardName = `playwright${Date.now()}`
  await page.locator('input#cardName').fill(cardName)
  await page.getByRole('button', { name: '확인' }).click()

  await page.waitForURL(/\/levelup\/record\?cardId=\d+&attemptId=\d+&attemptNo=\d+/)
  await page.getByText('음성으로 말해보세요.', { exact: true }).waitFor({ state: 'visible' })
  await page.getByRole('button', { name: '녹음 완료 및 피드백 받기' }).waitFor({ state: 'visible' })
}

function parseRecordParams(page) {
  const url = new URL(page.url())
  const cardId = Number(url.searchParams.get('cardId') ?? '')
  const attemptId = Number(url.searchParams.get('attemptId') ?? '')
  const attemptNo = Number(url.searchParams.get('attemptNo') ?? '1')
  assertOk(Number.isFinite(cardId) && cardId > 0, `Invalid cardId from URL: ${page.url()}`)
  assertOk(
    Number.isFinite(attemptId) && attemptId > 0,
    `Invalid attemptId from URL: ${page.url()}`,
  )
  assertOk(
    Number.isFinite(attemptNo) && attemptNo > 0,
    `Invalid attemptNo from URL: ${page.url()}`,
  )
  return { cardId, attemptId, attemptNo }
}

async function resolveAudioBytes() {
  return readFile(AUDIO_FILE)
}

async function submitAudioViaApis(page, { cardId, attemptId }) {
  const presignedRes = await page.request.post(new URL('/proxy-api/learning/presigned-url', BASE_URL).toString(), {
    data: { attemptId, contentType: DEFAULT_AUDIO_CONTENT_TYPE },
    headers: { 'Content-Type': 'application/json' },
  })
  assertOk(
    presignedRes.ok(),
    `presigned-url failed: ${presignedRes.status()} ${presignedRes.statusText()} ${await presignedRes.text()}`,
  )
  const presignedBody = await presignedRes.json()
  const uploadUrl = presignedBody?.data?.uploadUrl
  const objectKey = presignedBody?.data?.objectKey
  const contentType = presignedBody?.data?.contentType ?? DEFAULT_AUDIO_CONTENT_TYPE
  assertOk(uploadUrl && objectKey, 'Missing uploadUrl/objectKey from presigned response')

  const audioBytes = await resolveAudioBytes()
  const uploadRes = await page.request.put(uploadUrl, {
    data: audioBytes,
    headers: { 'Content-Type': contentType },
  })
  assertOk(
    uploadRes.ok(),
    `audio upload failed: ${uploadRes.status()} ${uploadRes.statusText()} ${await uploadRes.text()}`,
  )

  const completeRes = await page.request.put(
    new URL(`/proxy-api/cards/${cardId}/attempts/${attemptId}/upload-complete`, BASE_URL).toString(),
    {
      data: { objectKey, durationSeconds: 3 },
      headers: { 'Content-Type': 'application/json' },
    },
  )
  assertOk(
    completeRes.ok(),
    `upload-complete failed: ${completeRes.status()} ${completeRes.statusText()} ${await completeRes.text()}`,
  )
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function clickFirstPanelButton(panelLocator, label, options = {}) {
  const { skipTextPattern = null } = options
  const start = Date.now()
  while (Date.now() - start < DEFAULT_TIMEOUT_MS) {
    const buttons = panelLocator.getByRole('button')
    const count = await buttons.count()
    if (count > 0) {
      for (let index = 0; index < count; index += 1) {
        const candidate = buttons.nth(index)
        if (!(await candidate.isVisible())) continue
        const candidateText = ((await candidate.textContent()) ?? '').trim()
        if (skipTextPattern && skipTextPattern.test(candidateText)) {
          continue
        }
        if (await candidate.isEnabled()) {
          await candidate.click()
          console.log(
            `[STEP] ${label} first visible button clicked (index=${index}, total=${count}, text="${candidateText}")`,
          )
          return
        }
      }
    }
    await sleep(300)
  }
  throw new Error(`${label} button not found in levelup panel within timeout`)
}

async function waitForTerminalAttemptStatus(page, { cardId, attemptId }) {
  const start = Date.now()
  while (Date.now() - start < FEEDBACK_TIMEOUT_MS) {
    const detailsRes = await page.request.get(
      new URL(`/proxy-api/cards/${cardId}/attempts/${attemptId}`, BASE_URL).toString(),
    )
    if (!detailsRes.ok()) {
      await sleep(POLL_INTERVAL_MS)
      continue
    }
    const details = await detailsRes.json()
    const status = details?.data?.status
    if (TERMINAL_STATUSES.has(status)) return status
    await sleep(POLL_INTERVAL_MS)
  }
  throw new Error(`Timed out waiting terminal feedback status (attemptId=${attemptId})`)
}

async function waitForFeedbackPayload(page, { cardId, attemptId }, terminalStatus) {
  if (terminalStatus !== 'COMPLETED') {
    return
  }

  const start = Date.now()
  while (Date.now() - start < FEEDBACK_RESULT_TIMEOUT_MS) {
    const detailsRes = await page.request.get(
      new URL(`/proxy-api/cards/${cardId}/attempts/${attemptId}`, BASE_URL).toString(),
    )
    if (detailsRes.ok()) {
      const details = await detailsRes.json()
      const feedback = details?.data?.feedback
      const hasFeedback =
        feedback &&
        ['summary', 'keywords', 'facts', 'understanding', 'socraticFeedback'].some((key) => {
          const value = feedback?.[key]
          return typeof value === 'string' && value.trim().length > 0
        })
      if (hasFeedback) {
        console.log('[STEP] feedback payload confirmed from attempt details API.')
        return
      }
    }
    await sleep(POLL_INTERVAL_MS)
  }

  throw new Error(
    `Terminal status is COMPLETED but feedback payload is empty (attemptId=${attemptId})`,
  )
}

async function main() {
  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: SLOW_MO,
  })

  const context = await browser.newContext()
  const page = await context.newPage()
  page.setDefaultTimeout(DEFAULT_TIMEOUT_MS)
  let currentStep = 'init'

  try {
    currentStep = '1) /api/e2e/login'
    await e2eLogin(page, context)

    currentStep = '2) /main 확인'
    await runMainChecks(page)

    currentStep = '3) PVP 모드 진입 확인'
    await runPvpFlow(page)

    currentStep = '4~6) /main 복귀 -> 레벨업 진입 -> 카테고리/키워드 선택 -> 카드 생성 -> /levelup/record'
    await runLevelupFlow(page)

    currentStep = '7) presigned-url -> S3 업로드 -> upload-complete'
    const recordParams = parseRecordParams(page)
    await submitAudioViaApis(page, recordParams)

    currentStep = '8) /levelup/feedback 진입'
    await page.goto(
      new URL(
        `/levelup/feedback?cardId=${recordParams.cardId}&attemptId=${recordParams.attemptId}&attemptNo=${recordParams.attemptNo}`,
        BASE_URL,
      ).toString(),
      { waitUntil: 'domcontentloaded' },
    )
    await page.waitForURL(/\/levelup\/feedback\?cardId=\d+&attemptId=\d+&attemptNo=\d+/)
    await page.getByRole('button', { name: '학습 종료하기' }).waitFor({ state: 'visible' })

    currentStep = '9) attempt terminal status 확인'
    const terminalStatus = await waitForTerminalAttemptStatus(page, recordParams)
    await waitForFeedbackPayload(page, recordParams, terminalStatus)

    if (PAUSE_ON_FEEDBACK) {
      console.log(
        `[STEP] Feedback page pause enabled. Keeping browser open for ${FEEDBACK_PAUSE_MS}ms.`,
      )
      await sleep(FEEDBACK_PAUSE_MS)
    }

    console.log('[PASS] Release UI flow completed successfully.')
    console.log(`- BASE_URL: ${BASE_URL}`)
    console.log(`- DEVICE_UUID: ${DEVICE_UUID}`)
    console.log(`- TERMINAL_STATUS: ${terminalStatus}`)
  } catch (error) {
    console.error('[FAIL] Release UI flow failed.')
    console.error(`- FAIL_STEP: ${currentStep}`)
    console.error(error)
    process.exitCode = 1
  } finally {
    await context.close()
    await browser.close()
  }
}

main()
