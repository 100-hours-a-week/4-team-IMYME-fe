import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'

import { request } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'https://release.imymemine.kr'
const BACKEND_E2E_LOGIN_PATH = process.env.BACKEND_E2E_LOGIN_PATH ?? '/server/e2e/login'
const CONCURRENCY = Number(process.env.CONCURRENCY ?? '100')
const ITERATIONS = Number(process.env.ITERATIONS ?? '100')
const AUDIO_FILE =
  process.env.AUDIO_FILE ??
  '/Users/wonhyeonseob/Desktop/git/MINE/fe/4-team-IMYME-fe/playwright/release/assets/sample_speech.webm'
const AUDIO_CONTENT_TYPE = 'audio/webm'
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS ?? '2000')
const FEEDBACK_TIMEOUT_MS = Number(process.env.FEEDBACK_TIMEOUT_MS ?? '180000')
const TERMINAL_STATUSES = new Set(['COMPLETED', 'FAILED', 'EXPIRED'])

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function runSingleFlow(index) {
  const startTime = Date.now()
  const deviceUuid = randomUUID()
  let status = 'UNKNOWN'
  let ctx = null

  try {
    // 1. Login - 인증 없이 요청
    ctx = await request.newContext({ baseURL: BASE_URL })
    const loginRes = await ctx.post(BACKEND_E2E_LOGIN_PATH, {
      data: { deviceUuid },
      headers: { 'Content-Type': 'application/json' },
    })
    if (!loginRes.ok()) {
      throw new Error(`Login failed: ${loginRes.status()} ${await loginRes.text()}`)
    }
    const loginBody = await loginRes.json()
    const accessToken = loginBody?.data?.accessToken
    if (!accessToken) throw new Error('Missing accessToken')

    // 컨텍스트 재생성 (Authorization 헤더 포함)
    await ctx.dispose()
    ctx = await request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
    })

    // 2. Get categories
    const catRes = await ctx.get('/proxy-api/categories')
    if (!catRes.ok()) throw new Error(`Categories failed: ${catRes.status()}`)
    const categories = (await catRes.json())?.data ?? []
    const category = categories.find((c) => !/테스트/.test(c.name)) ?? categories[0]

    // 3. Get keywords
    const kwRes = await ctx.get(`/proxy-api/categories/${category.id}/keywords`)
    if (!kwRes.ok()) throw new Error(`Keywords failed: ${kwRes.status()}`)
    const keywords = (await kwRes.json())?.data ?? []
    const keyword = keywords[0]

    // 4. Create card
    const cardTitle = `load${Date.now()}-${index}`
    const cardRes = await ctx.post('/proxy-api/cards', {
      data: { categoryId: category.id, keywordId: keyword.id, title: cardTitle },
      headers: { 'Content-Type': 'application/json' },
    })
    if (!cardRes.ok()) throw new Error(`Create card failed: ${cardRes.status()} ${await cardRes.text()}`)
    const cardBody = await cardRes.json()
    const cardId = cardBody?.data?.cardId
    const attemptId = cardBody?.data?.attemptId
    if (!cardId || !attemptId) throw new Error('Missing cardId/attemptId')

    // 5. Get presigned URL
    const presignedRes = await ctx.post('/proxy-api/learning/presigned-url', {
      data: { attemptId, contentType: AUDIO_CONTENT_TYPE },
      headers: { 'Content-Type': 'application/json' },
    })
    if (!presignedRes.ok()) throw new Error(`Presigned URL failed: ${presignedRes.status()}`)
    const presignedBody = await presignedRes.json()
    const uploadUrl = presignedBody?.data?.uploadUrl
    const objectKey = presignedBody?.data?.objectKey

    // 6. Upload audio to S3
    const audioBytes = await readFile(AUDIO_FILE)
    const uploadRes = await ctx.put(uploadUrl, {
      data: audioBytes,
      headers: { 'Content-Type': AUDIO_CONTENT_TYPE },
    })
    if (!uploadRes.ok()) throw new Error(`Upload failed: ${uploadRes.status()}`)

    // 7. Complete upload
    const completeRes = await ctx.put(`/proxy-api/cards/${cardId}/attempts/${attemptId}/upload-complete`, {
      data: { objectKey, durationSeconds: 3 },
      headers: { 'Content-Type': 'application/json' },
    })
    if (!completeRes.ok()) throw new Error(`Complete upload failed: ${completeRes.status()}`)

    // 8. Wait for terminal status
    const pollStart = Date.now()
    while (Date.now() - pollStart < FEEDBACK_TIMEOUT_MS) {
      const detailsRes = await ctx.get(`/proxy-api/cards/${cardId}/attempts/${attemptId}`)
      if (detailsRes.ok()) {
        const detailsBody = await detailsRes.json()
        status = detailsBody?.data?.status
        if (TERMINAL_STATUSES.has(status)) break
      }
      await sleep(POLL_INTERVAL_MS)
    }

    if (!TERMINAL_STATUSES.has(status)) {
      throw new Error('Timeout waiting for terminal status')
    }

    const duration = Date.now() - startTime
    return { index, ok: true, status, duration }
  } catch (error) {
    const duration = Date.now() - startTime
    return { index, ok: false, status, error: error.message, duration }
  } finally {
    if (ctx) await ctx.dispose()
  }
}

async function main() {
  console.log(`[LOAD TEST - Playwright] Starting...`)
  console.log(`- BASE_URL: ${BASE_URL}`)
  console.log(`- CONCURRENCY: ${CONCURRENCY}`)
  console.log(`- ITERATIONS: ${ITERATIONS}`)
  console.log(`- AUDIO_FILE: ${AUDIO_FILE}`)
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
