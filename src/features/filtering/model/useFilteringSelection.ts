'use client'

import { useState } from 'react'

import type { CategoryItemType } from '@/entities/category'
import type { KeywordItemType } from '@/entities/keyword'

type FilteringSelection = {
  category: CategoryItemType | null
  keyword: KeywordItemType | null
}

export function useFilteringSelection() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryItemType | null>(null)
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordItemType | null>(null)

  const handleFilteringApply = (selection: FilteringSelection) => {
    setSelectedCategory(selection.category)
    setSelectedKeyword(selection.keyword)
  }

  return {
    selectedCategory,
    selectedKeyword,
    handleFilteringApply,
    setSelectedCategory,
    setSelectedKeyword,
  }
}
