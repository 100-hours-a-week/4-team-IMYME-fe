import { proxyApiClient } from '@/shared/api'

export type MyCardItem = {
  id: number
  title: string
  createdAt: string
  categoryId: number
  categoryName: string
  keywordId: number
  keywordName: string
  bestLevel?: number
  attemptCount?: number
}

export type GetMyCardsParams = {
  limit?: number
  cursor?: string | null
}

export type MyCardsPagination = {
  nextCursor: string | null
  hasNext: boolean
  limit: number
}

export type MyCardsPage = {
  cards: MyCardItem[]
  pagination: MyCardsPagination
}

type MyCardsResponse = {
  success?: boolean
  data?: {
    cards?: MyCardItem[]
    pagination?: Partial<MyCardsPagination>
  }
  message?: string
  timestamp?: string
}

const MY_CARDS_PROXY_PATH = '/proxy-api/cards'
const DEFAULT_LIMIT = 5
const INITIAL_CURSOR = null
const INITIAL_HAS_NEXT = false

const buildFallbackPagination = (limit: number): MyCardsPagination => ({
  nextCursor: INITIAL_CURSOR,
  hasNext: INITIAL_HAS_NEXT,
  limit,
})

export async function getMyCardsPage(params: GetMyCardsParams = {}): Promise<MyCardsPage> {
  const resolvedLimit = params.limit ?? DEFAULT_LIMIT

  try {
    const response = await proxyApiClient.get<MyCardsResponse>(MY_CARDS_PROXY_PATH, {
      params: {
        limit: resolvedLimit,
        ...(params.cursor ? { cursor: params.cursor } : {}),
        ghost: false,
      },
    })

    const payload = response.data
    const cards = payload.data?.cards ?? []
    const pagination = payload.data?.pagination

    return {
      cards,
      pagination: {
        nextCursor: pagination?.nextCursor ?? INITIAL_CURSOR,
        hasNext: pagination?.hasNext ?? INITIAL_HAS_NEXT,
        limit: pagination?.limit ?? resolvedLimit,
      },
    }
  } catch (error) {
    console.error('Failed to fetch cards', error)
    return {
      cards: [],
      pagination: buildFallbackPagination(resolvedLimit),
    }
  }
}

export async function getMyCards(limit?: number): Promise<MyCardItem[]> {
  const page = await getMyCardsPage({ limit })
  return page.cards
}
