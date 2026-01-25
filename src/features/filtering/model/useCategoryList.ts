'use client'

import { useEffect, useState } from 'react'

import { getCategories } from './getCategories'

import type { CategoryItemType } from '@/entities/category'

export function useCategoryList(accessToken: string) {
  const [categories, setCategories] = useState<CategoryItemType[]>([])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (!accessToken) {
        setCategories([])
        return
      }

      try {
        const data = await getCategories(accessToken)
        if (!cancelled) setCategories(data)
      } catch (e) {
        if (!cancelled) setCategories([])
        console.error('Failed to load categories', e)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [accessToken])

  return categories
}
