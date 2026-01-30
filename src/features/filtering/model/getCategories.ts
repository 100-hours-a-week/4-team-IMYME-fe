import { httpClient } from '@/shared'

import type { CategoryItemType } from '@/entities/category'

type CategoryApiItem = {
  id: number
  name: string
  displayOrder: string
  isActive: boolean
}

type CategoryApiResponse = {
  data?: CategoryApiItem[]
}

export async function getCategories(accessToken: string): Promise<CategoryItemType[]> {
  try {
    const response = await httpClient.get<CategoryApiResponse>('/categories', {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
    })

    const items = response.data?.data ?? []

    return items.map((item) => ({
      id: item.id,
      categoryName: item.name,
    }))
  } catch (error) {
    console.error('Failed to fetch categories', error)
    return []
  }
}
