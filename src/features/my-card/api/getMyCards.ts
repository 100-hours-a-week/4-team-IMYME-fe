import { httpClient } from '@/shared'

export type MyCardItem = {
  id: number
  title: string
  createdAt: string
  categoryId: number
  categoryName: string
  keywordId: number
  keywordName: string
}

type MyCardsResponse = {
  data?: {
    cards?: MyCardItem[]
  }
}

export async function getMyCards(accessToken: string, limit?: number): Promise<MyCardItem[]> {
  try {
    const response = await httpClient.get<MyCardsResponse>('/cards', {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
      params: limit ? { limit } : undefined,
    })

    return response.data?.data?.cards ?? []
  } catch (error) {
    console.error('Failed to fetch cards', error)
    return []
  }
}
