import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'

import { chromium } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'https://release.imymemine.kr'
const E2E_LOGIN_PATH = process.env.E2E_LOGIN_PATH ?? '/api/e2e/login'
const BACKEND_E2E_LOGIN_PATH_HOST = process.env.BACKEND_E2E_LOGIN_PATH_HOST ?? '/server/e2e/login/host'
const BACKEND_E2E_LOGIN_PATH_GUEST = process.env.BACKEND_E2E_LOGIN_PATH_GUEST ?? '/server/e2e/login/guest'
const HOST_DEVICE_UUID = process.env.HOST_DEVICE_UUID ?? randomUUID()
const GUEST_DEVICE_UUID = process.env.GUEST_DEVICE_UUID ?? randomUUID()
const HOST_ACCESS_TOKEN = process.env.HOST_ACCESS_TOKEN ?? ''
const GUEST_ACCESS_TOKEN = process.env.GUEST_ACCESS_TOKEN ?? ''
const HEADLESS = process.env.HEADLESS !== 'false'
const SLOW_MO = Number(process.env.SLOW_MO ?? '0')
const DEFAULT_TIMEOUT_MS = Number(process.env.DEFAULT_TIMEOUT_MS ?? '15000')
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS ?? '2000')
const MATCH_TIMEOUT_MS = Number(process.env.MATCH_TIMEOUT_MS ?? '180000')
const ROOM_STATUS_TIMEOUT_MS = Number(process.env.ROOM_STATUS_TIMEOUT_MS ?? '180000')
const AUDIO_FILE =
  process.env.AUDIO_FILE ??
  '/Users/wonhyeonseob/Desktop/git/MINE/fe/4-team-IMYME-fe/playwright/release/assets/sample_speech.webm'
const PVP_AUDIO_CONTENT_TYPE = process.env.PVP_AUDIO_CONTENT_TYPE ?? 'audio/webm'
const PVP_AUDIO_DURATION_SECONDS = Number(process.env.PVP_AUDIO_DURATION_SECONDS ?? '1')
const PAUSE_ON_FEEDBACK = process.env.PAUSE_ON_FEEDBACK === 'true'
const FEEDBACK_PAUSE_MS = Number(process.env.FEEDBACK_PAUSE_MS ?? '60000')
const BACKEND_LOGIN_RETRY_COUNT = Number(process.env.BACKEND_LOGIN_RETRY_COUNT ?? '3')
const E2E_ACCESS_TOKEN_FALLBACK_EXPIRES_IN_MS = 10 * 60 * 1000

const ROOM_FINISHED_STATUS = 'FINISHED'
const ROOM_MATCHED_STATUS = 'MATCHED'
const ROOM_THINKING_STATUS = 'THINKING'
const ROOM_RECORDING_STATUS = 'RECORDING'
const ROOM_PROCESSING_STATUS = 'PROCESSING'

function assertOk(condition, message) {
  if (!condition) throw new Error(message)
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function parseJwtSub(token) {
  try {
    const payloadBase64 = token.split('.')[1]
    if (!payloadBase64) return ''
    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8')
    const payload = JSON.parse(payloadJson)
    return String(payload?.sub ?? '')
  } catch {
    return ''
  }
}

function resolveAccessTokenExpiresAtMs(rawValue) {
  const raw = Number(rawValue)
  if (!Number.isFinite(raw) || raw <= 0) {
    return Date.now() + E2E_ACCESS_TOKEN_FALLBACK_EXPIRES_IN_MS
  }
  if (raw > 10_000_000_000) {
    return raw
  }
  return Date.now() + raw * 1000
}

async function setAuthCookies(context, { accessToken, refreshToken = '', expiresIn = 3600 }) {
  const accessTokenExpiresAtMs = resolveAccessTokenExpiresAtMs(expiresIn)
  const cookieBaseUrl = new URL(BASE_URL).origin

  const cookies = [
    {
      url: cookieBaseUrl,
      name: 'access_token',
      value: accessToken,
      httpOnly: true,
      sameSite: 'Lax',
    },
    {
      url: cookieBaseUrl,
      name: 'access_token_expires_at',
      value: String(accessTokenExpiresAtMs),
      httpOnly: true,
      sameSite: 'Lax',
    },
    {
      url: cookieBaseUrl,
      name: 'e2e_access_token',
      value: accessToken,
      httpOnly: false,
      sameSite: 'Lax',
    },
    {
      url: cookieBaseUrl,
      name: 'e2e_access_token_expires_at',
      value: String(accessTokenExpiresAtMs),
      httpOnly: false,
      sameSite: 'Lax',
    },
  ]

  if (refreshToken) {
    cookies.push({
      url: cookieBaseUrl,
      name: 'refresh_token',
      value: refreshToken,
      httpOnly: true,
      sameSite: 'Lax',
    })
  }

  await context.addCookies(cookies)
}

async function e2eLoginContext(page, context, { deviceUuid, accessTokenOverride, label }) {
  // HOST/GUEST에 따라 다른 백엔드 엔드포인트 사용
  const backendLoginPath = label === 'HOST' ? BACKEND_E2E_LOGIN_PATH_HOST : BACKEND_E2E_LOGIN_PATH_GUEST

  if (accessTokenOverride) {
    await setAuthCookies(context, { accessToken: accessTokenOverride, expiresIn: 3600 })
    const sub = parseJwtSub(accessTokenOverride)
    assertOk(sub, `${label} access token override is invalid JWT`)
    console.log(`[STEP 1] ${label} login succeeded via token override (sub=${sub})`)
    return { sub }
  }

  const apiResponse = await page.request.post(new URL(E2E_LOGIN_PATH, BASE_URL).toString(), {
    data: { deviceUuid },
    headers: { 'Content-Type': 'application/json' },
  })

  if (apiResponse.ok()) {
    const apiBody = await apiResponse.json().catch(() => null)
    const sub = parseJwtSub(apiBody?.data?.accessToken ?? '')
    console.log(`[STEP 1] ${label} login succeeded via ${E2E_LOGIN_PATH}${sub ? ` (sub=${sub})` : ''}`)
    return { sub }
  }

  const apiErrorBody = await apiResponse.text()
  const isBlockedByReleasePolicy = apiResponse.status() === 404 && apiErrorBody.includes('Not allowed')
  if (!isBlockedByReleasePolicy) {
    throw new Error(
      `${label} e2e login failed: ${apiResponse.status()} ${apiResponse.statusText()} ${apiErrorBody}`,
    )
  }

  let backendResponse = null
  let backendError = ''
  for (let attempt = 1; attempt <= BACKEND_LOGIN_RETRY_COUNT; attempt += 1) {
    const response = await page.request.post(new URL(backendLoginPath, BASE_URL).toString(), {
      data: { deviceUuid },
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.ok()) {
      backendResponse = response
      break
    }
    backendError = `${response.status()} ${response.statusText()} ${await response.text()}`
    await sleep(500)
  }
  assertOk(backendResponse, `${label} backend e2e login failed after retry: ${backendError}`)

  const backendBody = await backendResponse.json()
  const accessToken = backendBody?.data?.accessToken
  const refreshToken = backendBody?.data?.refreshToken
  assertOk(accessToken && refreshToken, `${label} backend login response missing token`)

  await setAuthCookies(context, {
    accessToken,
    refreshToken,
    expiresIn: backendBody?.data?.expiresIn,
  })

  const sub = parseJwtSub(accessToken)
  console.log(
    `[STEP 1] ${label} ${E2E_LOGIN_PATH} blocked -> fallback via ${backendLoginPath} (sub=${sub || 'unknown'})`,
  )
  return { sub }
}

async function runMainAndPvpEntryChecks(page, { label }) {
  await page.goto(new URL('/main', BASE_URL).toString(), { waitUntil: 'networkidle' })
  assertOk(page.url().includes('/main'), `${label} expected /main, got: ${page.url()}`)
  const pvpButton = page.getByRole('button', { name: 'PVP 모드' })
  await pvpButton.waitFor({ state: 'visible', timeout: 30000 })
  await pvpButton.click()
  await page.waitForURL(/\/pvp(\?|$)/, { timeout: 30000 })
  await page.getByText('매칭 입장하기', { exact: true }).waitFor({ state: 'visible' })
  await page.getByText('매칭 만들기', { exact: true }).waitFor({ state: 'visible' })
}

async function fetchCategories(page) {
  const response = await page.request.get(new URL('/proxy-api/categories', BASE_URL).toString())
  assertOk(
    response.ok(),
    `categories API failed: ${response.status()} ${response.statusText()} ${await response.text()}`,
  )
  const body = await response.json()
  const items = body?.data ?? []
  assertOk(Array.isArray(items) && items.length > 0, 'categories API returned empty list')
  return items
}

function pickCategory(categories) {
  const candidate = categories.find((item) => !/테스트/.test(String(item?.name ?? '')))
  return candidate ?? categories[0]
}

async function createPvpRoom(page, categoryId) {
  const roomName = `pw${Date.now().toString().slice(-8)}`
  const response = await page.request.post(new URL('/proxy-api/pvp/rooms', BASE_URL).toString(), {
    data: { categoryId, roomName },
    headers: { 'Content-Type': 'application/json' },
  })
  assertOk(
    response.ok(),
    `create room failed: ${response.status()} ${response.statusText()} ${await response.text()}`,
  )
  const body = await response.json()
  const roomId = Number(body?.data?.room?.id)
  assertOk(Number.isFinite(roomId) && roomId > 0, `invalid room id from create response: ${JSON.stringify(body)}`)
  return { roomId, roomName }
}

async function joinPvpRoom(page, roomId) {
  const response = await page.request.post(new URL(`/proxy-api/pvp/rooms/${roomId}/join`, BASE_URL).toString(), {
    headers: { 'Content-Type': 'application/json' },
  })
  assertOk(
    response.ok(),
    `join room failed: ${response.status()} ${response.statusText()} ${await response.text()}`,
  )
}

async function getRoomDetails(page, roomId) {
  const response = await page.request.get(new URL(`/proxy-api/pvp/rooms/${roomId}`, BASE_URL).toString())
  assertOk(
    response.ok(),
    `room details failed: ${response.status()} ${response.statusText()} ${await response.text()}`,
  )
  const body = await response.json()
  return body?.data
}

async function waitRoomStatus(page, roomId, targetStatuses, timeoutMs, label) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const details = await getRoomDetails(page, roomId)
    const status = details?.status
    if (targetStatuses.has(status)) {
      console.log(`[STEP] ${label} reached room status: ${status}`)
      return details
    }
    await sleep(POLL_INTERVAL_MS)
  }
  throw new Error(
    `${label} timed out waiting room status in [${[...targetStatuses].join(', ')}] (roomId=${roomId})`,
  )
}

async function startPvpRecording(page, roomId, label) {
  const response = await page.request.post(
    new URL(`/proxy-api/pvp/rooms/${roomId}/start-recording`, BASE_URL).toString(),
    { headers: { 'Content-Type': 'application/json' } },
  )
  assertOk(
    response.ok(),
    `${label} start-recording failed: ${response.status()} ${response.statusText()} ${await response.text()}`,
  )
}

async function loadAudioBytes() {
  return readFile(AUDIO_FILE)
}

async function submitPvpAudio(page, roomId, audioBytes, label) {
  const createResponse = await page.request.post(
    new URL(`/proxy-api/pvp/rooms/${roomId}/submissions`, BASE_URL).toString(),
    {
      data: {
        fileName: `pvp-submission-${Date.now()}.webm`,
        contentType: PVP_AUDIO_CONTENT_TYPE,
        fileSize: audioBytes.length,
      },
      headers: { 'Content-Type': 'application/json' },
    },
  )
  assertOk(
    createResponse.ok(),
    `${label} create submission failed: ${createResponse.status()} ${createResponse.statusText()} ${await createResponse.text()}`,
  )
  const createBody = await createResponse.json()
  const submissionId = Number(createBody?.data?.submissionId)
  const uploadUrl = createBody?.data?.uploadUrl
  assertOk(Number.isFinite(submissionId) && submissionId > 0, `${label} invalid submissionId`)
  assertOk(uploadUrl, `${label} missing uploadUrl`)

  const uploadResponse = await page.request.put(uploadUrl, {
    data: audioBytes,
    headers: { 'Content-Type': PVP_AUDIO_CONTENT_TYPE },
  })
  assertOk(
    uploadResponse.ok(),
    `${label} submission upload failed: ${uploadResponse.status()} ${uploadResponse.statusText()} ${await uploadResponse.text()}`,
  )

  const completeResponse = await page.request.post(
    new URL(`/proxy-api/pvp/rooms/submissions/${submissionId}/complete`, BASE_URL).toString(),
    {
      data: { durationSeconds: PVP_AUDIO_DURATION_SECONDS },
      headers: { 'Content-Type': 'application/json' },
    },
  )
  assertOk(
    completeResponse.ok(),
    `${label} submission complete failed: ${completeResponse.status()} ${completeResponse.statusText()} ${await completeResponse.text()}`,
  )
}

function hasNonEmptyFeedback(feedback) {
  if (!feedback) return false
  const hasText = ['summary', 'facts', 'understanding', 'personalizedFeedback'].some((key) => {
    const value = feedback?.[key]
    return typeof value === 'string' && value.trim().length > 0
  })
  const hasKeywords = Array.isArray(feedback?.keywords) && feedback.keywords.length > 0
  return hasText || hasKeywords
}

async function verifyPvpResultPayload(page, roomId, label) {
  const response = await page.request.get(new URL(`/proxy-api/pvp/rooms/${roomId}/result`, BASE_URL).toString())
  assertOk(
    response.ok(),
    `${label} result API failed: ${response.status()} ${response.statusText()} ${await response.text()}`,
  )
  const body = await response.json()
  const status = body?.data?.status
  assertOk(status === ROOM_FINISHED_STATUS, `${label} expected FINISHED result status, got: ${status}`)
  assertOk(hasNonEmptyFeedback(body?.data?.myResult?.feedback), `${label} myResult.feedback is empty`)
  return body?.data
}

async function runFeedbackPageChecks(page, roomId) {
  await page.goto(new URL(`/pvp/feedback/${roomId}`, BASE_URL).toString(), { waitUntil: 'domcontentloaded' })
  await page.waitForURL(new RegExp(`/pvp/feedback/${roomId}(\\?|$)`))
  await page.getByText('비교 피드백', { exact: true }).waitFor({ state: 'visible' })
  await page.getByText('요약', { exact: true }).first().waitFor({ state: 'visible' })
}

async function main() {
  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: SLOW_MO,
  })
  const hostContext = await browser.newContext()
  const guestContext = await browser.newContext()
  const hostPage = await hostContext.newPage()
  const guestPage = await guestContext.newPage()
  hostPage.setDefaultTimeout(DEFAULT_TIMEOUT_MS)
  guestPage.setDefaultTimeout(DEFAULT_TIMEOUT_MS)
  let currentStep = 'init'

  try {
    currentStep = '1) host/guest login'
    const hostLogin = await e2eLoginContext(hostPage, hostContext, {
      deviceUuid: HOST_DEVICE_UUID,
      accessTokenOverride: HOST_ACCESS_TOKEN,
      label: 'HOST',
    })
    const guestLogin = await e2eLoginContext(guestPage, guestContext, {
      deviceUuid: GUEST_DEVICE_UUID,
      accessTokenOverride: GUEST_ACCESS_TOKEN,
      label: 'GUEST',
    })

    assertOk(hostLogin.sub && guestLogin.sub, 'Failed to resolve host/guest user id from access token')
    assertOk(
      hostLogin.sub !== guestLogin.sub,
      `HOST/GUEST are same user (sub=${hostLogin.sub}). Provide distinct HOST_ACCESS_TOKEN and GUEST_ACCESS_TOKEN.`,
    )

    currentStep = '2) host/guest pvp entry checks'
    await runMainAndPvpEntryChecks(hostPage, { label: 'HOST' })
    await runMainAndPvpEntryChecks(guestPage, { label: 'GUEST' })

    currentStep = '3) host room create'
    const categories = await fetchCategories(hostPage)
    const pickedCategory = pickCategory(categories)
    assertOk(Number.isFinite(Number(pickedCategory?.id)), 'invalid picked category')
    const { roomId, roomName } = await createPvpRoom(hostPage, Number(pickedCategory.id))
    console.log(`[STEP] HOST created room (roomId=${roomId}, roomName=${roomName}, category=${pickedCategory.name})`)

    currentStep = '4) guest join room'
    await joinPvpRoom(guestPage, roomId)
    await waitRoomStatus(hostPage, roomId, new Set([ROOM_MATCHED_STATUS]), MATCH_TIMEOUT_MS, 'host')

    currentStep = '5) wait THINKING (auto transition after 3s)'
    await waitRoomStatus(
      hostPage,
      roomId,
      new Set([ROOM_THINKING_STATUS]),
      ROOM_STATUS_TIMEOUT_MS,
      'host',
    )

    currentStep = '6) host/guest ready(start-recording)'
    await startPvpRecording(hostPage, roomId, 'HOST')
    await startPvpRecording(guestPage, roomId, 'GUEST')

    currentStep = '7) wait RECORDING'
    await waitRoomStatus(
      hostPage,
      roomId,
      new Set([ROOM_RECORDING_STATUS, ROOM_PROCESSING_STATUS]),
      ROOM_STATUS_TIMEOUT_MS,
      'host',
    )

    currentStep = '8) host/guest submit audio'
    const audioBytes = await loadAudioBytes()
    assertOk(audioBytes.length > 0, `audio file is empty: ${AUDIO_FILE}`)
    await submitPvpAudio(hostPage, roomId, audioBytes, 'HOST')
    await submitPvpAudio(guestPage, roomId, audioBytes, 'GUEST')

    currentStep = '9) wait room FINISHED'
    await waitRoomStatus(hostPage, roomId, new Set([ROOM_FINISHED_STATUS]), ROOM_STATUS_TIMEOUT_MS, 'host')

    currentStep = '10) host/guest feedback payload verify'
    await verifyPvpResultPayload(hostPage, roomId, 'HOST')
    await verifyPvpResultPayload(guestPage, roomId, 'GUEST')

    currentStep = '11) host /pvp/feedback/{id} page check'
    await runFeedbackPageChecks(hostPage, roomId)

    if (PAUSE_ON_FEEDBACK) {
      console.log(`[STEP] Feedback page pause enabled. Keeping browser open for ${FEEDBACK_PAUSE_MS}ms.`)
      await sleep(FEEDBACK_PAUSE_MS)
    }

    console.log('[PASS] Release PVP UI flow completed successfully.')
    console.log(`- BASE_URL: ${BASE_URL}`)
    console.log(`- HOST_DEVICE_UUID: ${HOST_DEVICE_UUID}`)
    console.log(`- GUEST_DEVICE_UUID: ${GUEST_DEVICE_UUID}`)
    console.log(`- ROOM_ID: ${roomId}`)
    console.log(`- RESULT_STATUS: ${ROOM_FINISHED_STATUS}`)
  } catch (error) {
    console.error('[FAIL] Release PVP UI flow failed.')
    console.error(`- FAIL_STEP: ${currentStep}`)
    console.error(error)
    process.exitCode = 1
  } finally {
    await hostContext.close()
    await guestContext.close()
    await browser.close()
  }
}

main()
