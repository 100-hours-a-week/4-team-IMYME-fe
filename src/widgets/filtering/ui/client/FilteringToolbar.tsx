'use client'

import { SlidersVertical } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useState } from 'react'

import { FilteringCondition } from '@/features/filtering'
import { Drawer, DrawerTrigger } from '@/shared/ui/drawer'

import { FilteringTab } from './FilteringTab'

import type { CategoryItemType } from '@/entities/category'
import type { KeywordItemType } from '@/entities/keyword'

type FilteringToolbarProps = {
  variant?: 'category' | 'keyword'
  selectedCategory: CategoryItemType | null
  selectedKeyword: KeywordItemType | null
  onApply: (selection: {
    category: CategoryItemType | null
    keyword: KeywordItemType | null
  }) => void
  showResetButton?: boolean
  lazyLoadFilteringTab?: boolean
}

const FilteringTabLazy = dynamic(
  () => import('./FilteringTab').then((module) => module.FilteringTab),
  {
    ssr: false,
    loading: () => null,
  },
)

export function FilteringToolbar({
  variant = 'keyword',
  selectedCategory,
  selectedKeyword,
  onApply,
  showResetButton = false,
  lazyLoadFilteringTab = false,
}: FilteringToolbarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const handleApply = (selection: {
    category: CategoryItemType | null
    keyword: KeywordItemType | null
  }) => {
    onApply(selection)
    setIsFilterOpen(false)
  }

  const shouldRenderFilteringTab = isFilterOpen || !lazyLoadFilteringTab
  const renderFilteringTab = () => {
    if (!shouldRenderFilteringTab) return null

    if (lazyLoadFilteringTab) {
      return (
        <FilteringTabLazy
          variant={variant}
          onApply={handleApply}
          onClose={() => setIsFilterOpen(false)}
        />
      )
    }

    return (
      <FilteringTab
        variant={variant}
        onApply={handleApply}
        onClose={() => setIsFilterOpen(false)}
      />
    )
  }

  return (
    <div className="ml-10 flex">
      <FilteringCondition
        selectedCategory={selectedCategory}
        selectedKeyword={selectedKeyword}
        showResetButton={showResetButton}
      />
      <Drawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
      >
        <DrawerTrigger className="mr-10 ml-auto flex items-center gap-1">
          <SlidersVertical size={18} />
          <p className="cursor-pointer text-sm">필터</p>
        </DrawerTrigger>
        {renderFilteringTab()}
      </Drawer>
    </div>
  )
}
