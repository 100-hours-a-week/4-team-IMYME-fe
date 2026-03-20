import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'

const BASE_URL = process.env.BASE_URL ?? 'https://release.imymemine.kr'
const E2E_LOGIN_PATH = '/server/e2e/login' // VU별: /server/e2e/login/{vuId}
const CONCURRENCY = Number(process.env.CONCURRENCY ?? '100')
const ITERATIONS = Number(process.env.ITERATIONS ?? '100')
const AUDIO_FILE =
  process.env.AUDIO_FILE ??
  '/Users/wonhyeonseob/Desktop/git/MINE/fe/4-team-IMYME-fe/load/release/assets/sample_speech.webm'
const AUDIO_CONTENT_TYPE = 'audio/webm'
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS ?? '2000')
const FEEDBACK_TIMEOUT_MS = Number(process.env.FEEDBACK_TIMEOUT_MS ?? '180000')
const TERMINAL_STATUSES = new Set(['COMPLETED', 'FAILED', 'EXPIRED'])

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function e2eLogin(deviceUuid, vuId) {
  const loginPath = `${E2E_LOGIN_PATH}/${vuId}`
  const response = await fetch(new URL(loginPath, BASE_URL).toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceUuid }),
  })
  if (!response.ok) {
    throw new Error(`Login failed: ${loginPath} -> ${response.status} ${await response.text()}`)
  }
  const body = await response.json()
  const accessToken = body?.data?.accessToken
  if (!accessToken) throw new Error('Missing accessToken')
  return { accessToken }
}

async function fetchCategories(accessToken) {
  const response = await fetch(new URL('/server/categories', BASE_URL).toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) throw new Error(`Categories failed: ${response.status}`)
  const body = await response.json()
  return body?.data ?? []
}

async function fetchKeywords(accessToken, categoryId) {
  const response = await fetch(
    new URL(`/server/categories/${categoryId}/keywords`, BASE_URL).toString(),
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  if (!response.ok) throw new Error(`Keywords failed: ${response.status}`)
  const body = await response.json()
  return body?.data?.keywords ?? []
}

async function createCard(accessToken, { categoryId, keywordId, title }) {
  const response = await fetch(new URL('/server/cards', BASE_URL).toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ categoryId, keywordId, title }),
  })
  if (!response.ok) throw new Error(`Create card failed: ${response.status} ${await response.text()}`)
  const body = await response.json()
  const cardId = body?.data?.id
  if (!cardId) throw new Error('Missing cardId')
  return { cardId }
}

async function createAttempt(accessToken, cardId) {
  const response = await fetch(new URL(`/server/cards/${cardId}/attempts`, BASE_URL).toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  if (!response.ok) throw new Error(`Create attempt failed: ${response.status} ${await response.text()}`)
  const body = await response.json()
  const attemptId = body?.data?.attemptId
  if (!attemptId) throw new Error('Missing attemptId')
  return { attemptId }
}

async function getPresignedUrl(accessToken, attemptId) {
  const response = await fetch(new URL('/server/learning/presigned-url', BASE_URL).toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ attemptId, contentType: AUDIO_CONTENT_TYPE }),
  })
  if (!response.ok) throw new Error(`Presigned URL failed: ${response.status}`)
  const body = await response.json()
  return { uploadUrl: body?.data?.uploadUrl, objectKey: body?.data?.objectKey }
}

async function uploadAudio(uploadUrl, audioBytes) {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': AUDIO_CONTENT_TYPE },
    body: audioBytes,
  })
  if (!response.ok) throw new Error(`Upload failed: ${response.status}`)
}

async function completeUpload(accessToken, { cardId, attemptId, objectKey }) {
  const response = await fetch(
    new URL(`/server/cards/${cardId}/attempts/${attemptId}/upload-complete`, BASE_URL).toString(),
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ objectKey, durationSeconds: 3 }),
    },
  )
  if (!response.ok) throw new Error(`Complete upload failed: ${response.status}`)
}

async function waitForTerminalStatus(accessToken, { cardId, attemptId }) {
  const start = Date.now()
  while (Date.now() - start < FEEDBACK_TIMEOUT_MS) {
    const response = await fetch(
      new URL(`/server/cards/${cardId}/attempts/${attemptId}`, BASE_URL).toString(),
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    if (response.ok) {
      const body = await response.json()
      const status = body?.data?.status
      if (TERMINAL_STATUSES.has(status)) return status
    }
    await sleep(POLL_INTERVAL_MS)
  }
  throw new Error('Timeout waiting for terminal status')
}

async function runSingleFlow(index) {
  const startTime = Date.now()
  const deviceUuid = randomUUID()
  let status = 'UNKNOWN'

  try {
    // 1. Login (VU별 다른 유저)
    const vuId = index + 1 // 1부터 시작
    const { accessToken } = await e2eLogin(deviceUuid, vuId)

    // 2. Get categories & keywords
    const categories = await fetchCategories(accessToken)
    const category = categories.find((c) => !/테스트/.test(c.name)) ?? categories[0]
    const keywords = await fetchKeywords(accessToken, category.id)
    const keyword = keywords[0]

    // 3. Create card
    const cardTitle = `load${Date.now()}-${index}`
    const { cardId } = await createCard(accessToken, {
      categoryId: category.id,
      keywordId: keyword.id,
      title: cardTitle,
    })

    // 4. Create attempt
    const { attemptId } = await createAttempt(accessToken, cardId)

    // 5. Get presigned URL & upload audio
    const { uploadUrl, objectKey } = await getPresignedUrl(accessToken, attemptId)
    const audioBytes = await readFile(AUDIO_FILE)
    await uploadAudio(uploadUrl, audioBytes)

    // 6. Complete upload
    await completeUpload(accessToken, { cardId, attemptId, objectKey })

    // 7. Wait for feedback
    status = await waitForTerminalStatus(accessToken, { cardId, attemptId })

    const duration = Date.now() - startTime
    return { index, ok: true, status, duration }
  } catch (error) {
    const duration = Date.now() - startTime
    return { index, ok: false, status, error: error.message, duration }
  }
}

async function main() {
  console.log(`[LOAD TEST] Starting...`)
  console.log(`- BASE_URL: ${BASE_URL}`)
  console.log(`- CONCURRENCY: ${CONCURRENCY}`)
  console.log(`- ITERATIONS: ${ITERATIONS}`)
  console.log(`- AUDIO_FILE: ${AUDIO_FILE}`)
  console.log(`- E2E_LOGIN_PATH: ${E2E_LOGIN_PATH}`)
  console.log('')

  const results = []
  const startTime = Date.now()

  for (let i = 0; i < ITERATIONS; i += CONCURRENCY) {
    const batchSize = Math.min(CONCURRENCY, ITERATIONS - i)
    const batchStart = Date.now()

    console.log(`[BATCH ${Math.floor(i / CONCURRENCY) + 1}] Running ${batchSize} concurrent requests...`)

    const batch = Array.from({ length: batchSize }, (_, idx) => runSingleFlow(i + idx))
    const batchResults = await Promise.all(batch)
    results.push(...batchResults)

    const batchDuration = Date.now() - batchStart
    const successCount = batchResults.filter((r) => r.ok).length
    console.log(`[BATCH ${Math.floor(i / CONCURRENCY) + 1}] Done in ${batchDuration}ms (${successCount}/${batchSize} success)`)
  }

  const totalDuration = Date.now() - startTime
  const successResults = results.filter((r) => r.ok)
  const failedResults = results.filter((r) => !r.ok)
  const completedResults = results.filter((r) => r.status === 'COMPLETED')

  console.log('')
  console.log('=== LOAD TEST RESULTS ===')
  console.log(`Total: ${results.length}`)
  console.log(`Success: ${successResults.length}`)
  console.log(`Failed: ${failedResults.length}`)
  console.log(`COMPLETED: ${completedResults.length}`)
  console.log(`Total Duration: ${totalDuration}ms`)

  if (successResults.length > 0) {
    const durations = successResults.map((r) => r.duration)
    const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    const minDuration = Math.min(...durations)
    const maxDuration = Math.max(...durations)
    console.log(`Avg Duration: ${avgDuration}ms`)
    console.log(`Min Duration: ${minDuration}ms`)
    console.log(`Max Duration: ${maxDuration}ms`)
  }

  if (failedResults.length > 0) {
    console.log('')
    console.log('=== FAILURES ===')
    failedResults.forEach((r) => {
      console.log(`[${r.index}] ${r.error}`)
    })
  }
}

main()
