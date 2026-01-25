import { httpClient } from '@/shared'

import type { KeywordItemType } from '@/entities/keyword'

interface KeywordApiItem {
  id: number
  name: string
  displayOrder: string
  isActive: boolean
}

interface KeywordApiResponse {
  keywords?: KeywordApiItem[]
}

export async function getKeywords(
  accessToken: string,
  categoryId: number | null,
): Promise<KeywordItemType[]> {
  try {
    const response = await httpClient.get<KeywordApiResponse>(
      `/categories/${categoryId}/keywords`,
      {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        },
      },
    )

    const items = response.data?.keywords ?? []

    return items.map((item) => ({
      id: item.id,
      keywordName: item.name,
    }))
  } catch (error) {
    console.error('Failed to fetch keywords', error)
    return []
  }
}
