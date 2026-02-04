'use client'

import { SlidersVertical } from 'lucide-react'
import { useState } from 'react'

import { FilteringCondition } from '@/features/filtering'
import { Drawer, DrawerTrigger } from '@/shared/ui/drawer'
import { FilteringTab } from '@/widgets/filtering'

import type { CategoryItemType } from '@/entities/category'
import type { KeywordItemType } from '@/entities/keyword'

type FilteringToolbarProps = {
  selectedCategory: CategoryItemType | null
  selectedKeyword: KeywordItemType | null
  onApply: (selection: {
    category: CategoryItemType | null
    keyword: KeywordItemType | null
  }) => void
  showResetButton?: boolean
}

export function FilteringToolbar({
  selectedCategory,
  selectedKeyword,
  onApply,
  showResetButton = false,
}: FilteringToolbarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const handleApply = (selection: {
    category: CategoryItemType | null
    keyword: KeywordItemType | null
  }) => {
    onApply(selection)
    setIsFilterOpen(false)
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
        <FilteringTab
          onApply={handleApply}
          onClose={() => setIsFilterOpen(false)}
        />
      </Drawer>
    </div>
  )
}
