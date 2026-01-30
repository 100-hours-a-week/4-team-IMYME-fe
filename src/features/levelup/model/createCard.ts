import { httpClient } from '@/shared'

type CreateCardPayload = {
  categoryId: number
  keywordId: number
  title: string
}

type CreateCardResponse = {
  data?: {
    id: number
    categoryId: number
    categoryName: string
    keywordId: number
    keywordName: string
    title: string
    attemptCount: number
    createdAt: string
  }
}

export async function createCard(accessToken: string, payload: CreateCardPayload) {
  try {
    const response = await httpClient.post<CreateCardResponse>('/cards', payload, {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
    })

    return response.data
  } catch (error) {
    console.error('Failed to create card', error)
    return null
  }
}
