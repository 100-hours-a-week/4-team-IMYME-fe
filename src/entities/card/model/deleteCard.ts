import { httpClient } from '@/shared'

export async function deleteCard(accessToken: string, cardId: number) {
  try {
    const response = await httpClient.delete(`/cards/${cardId}`, {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
    })

    return response.status === 204
  } catch (error) {
    console.error('Failed to delete card', error)
    return false
  }
}
