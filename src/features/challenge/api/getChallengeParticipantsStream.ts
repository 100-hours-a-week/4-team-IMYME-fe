import { httpClient } from '@/shared/api'

type GetChallengeParticipantsStreamParams = {
  challengeId: number
}

export type ChallengeParticipantsCountPayload = {
  count: number
}

type GetChallengeParticipantsStreamOptions = {
  onCount: (count: number) => void
  onOpen?: () => void
  onError?: (event: Event) => void
}

export type GetChallengeParticipantsStreamResult =
  | { ok: true; eventSource: EventSource }
  | { ok: false; reason: string }

const CHALLENGES_PATH_PREFIX = '/challenges'
const PARTICIPANTS_STREAM_PATH_SUFFIX = 'participants/stream'
const INVALID_PARAMS_REASON = 'invalid_params'
const REQUEST_FAILED_REASON = 'request_failed'
const COUNT_EVENT_NAME = 'count'

const createChallengeParticipantsStreamPath = (challengeId: number) =>
  `${CHALLENGES_PATH_PREFIX}/${challengeId}/${PARTICIPANTS_STREAM_PATH_SUFFIX}`

const createChallengeParticipantsStreamUrl = (challengeId: number) =>
  httpClient.getUri({
    url: createChallengeParticipantsStreamPath(challengeId),
  })

const parseChallengeParticipantsStreamData = (data: string): unknown => {
  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}

const parseChallengeParticipantsCountPayload = (
  value: unknown,
  expectedEventName?: string,
): { ok: true; data: ChallengeParticipantsCountPayload } | { ok: false; reason: string } => {
  if (!value || typeof value !== 'object') {
    return { ok: false, reason: REQUEST_FAILED_REASON }
  }

  const payload = value as {
    count?: unknown
    event?: unknown
    type?: unknown
    data?: unknown
  }

  const eventNameFromPayload =
    typeof payload.event === 'string'
      ? payload.event
      : typeof payload.type === 'string'
        ? payload.type
        : undefined

  if (expectedEventName && eventNameFromPayload && eventNameFromPayload !== expectedEventName) {
    return { ok: false, reason: REQUEST_FAILED_REASON }
  }

  if (typeof payload.count !== 'number') {
    const nestedData = payload.data
    if (!nestedData || typeof nestedData !== 'object') {
      return { ok: false, reason: REQUEST_FAILED_REASON }
    }

    const nestedCount = (nestedData as { count?: unknown }).count
    if (typeof nestedCount !== 'number') {
      return { ok: false, reason: REQUEST_FAILED_REASON }
    }

    return { ok: true, data: { count: nestedCount } }
  }

  return { ok: true, data: { count: payload.count } }
}

export function getChallengeParticipantsStream(
  params: GetChallengeParticipantsStreamParams,
  { onCount, onOpen, onError }: GetChallengeParticipantsStreamOptions,
): GetChallengeParticipantsStreamResult {
  if (!params.challengeId) {
    return { ok: false, reason: INVALID_PARAMS_REASON }
  }

  try {
    const eventSource = new EventSource(createChallengeParticipantsStreamUrl(params.challengeId))
    eventSource.onopen = () => {
      onOpen?.()
    }

    const handleCountEvent = (event: MessageEvent<string>) => {
      const payload = parseChallengeParticipantsStreamData(event.data)
      const parsedCountPayload = parseChallengeParticipantsCountPayload(payload, COUNT_EVENT_NAME)
      if (!parsedCountPayload.ok) {
        return
      }

      onCount(parsedCountPayload.data.count)
    }
    eventSource.addEventListener(COUNT_EVENT_NAME, handleCountEvent)

    if (onError) {
      eventSource.onerror = onError
    }

    return { ok: true, eventSource }
  } catch (error) {
    console.error('Failed to open challenge participants stream', error)
    return { ok: false, reason: REQUEST_FAILED_REASON }
  }
}
