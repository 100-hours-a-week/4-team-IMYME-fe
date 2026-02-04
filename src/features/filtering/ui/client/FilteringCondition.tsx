'use client'

import { ChevronRight, RotateCcw } from 'lucide-react'

import type { CategoryItemType } from '@/entities/category'
import type { KeywordItemType } from '@/entities/keyword'

type FilteringConditionProps = {
  selectedCategory: CategoryItemType | null
  selectedKeyword: KeywordItemType | null
  onReset?: () => void
  showResetButton?: boolean
}

const WRAPPER_CLASSNAME = 'flex min-h-5 items-start gap-2'
const TEXT_CLASSNAME = 'flex min-w-0 flex-1 flex-wrap items-center gap-1 break-words'
const RESET_BUTTON_CLASSNAME =
  'ml-auto flex shrink-0 items-center gap-2 whitespace-nowrap cursor-pointer'

export function FilteringCondition({
  selectedCategory,
  selectedKeyword,
  onReset,
  showResetButton = true,
}: FilteringConditionProps) {
  return (
    <div className={WRAPPER_CLASSNAME}>
      <div className={TEXT_CLASSNAME}>
        {selectedCategory ? selectedCategory.categoryName : ''}
        {selectedKeyword ? (
          <>
            <ChevronRight size={16} />
            {selectedKeyword.keywordName}
          </>
        ) : (
          ''
        )}
      </div>
      {showResetButton ? (
        <div
          className={RESET_BUTTON_CLASSNAME}
          onClick={onReset}
        >
          필터 초기화
          <RotateCcw size={16} />
        </div>
      ) : null}
    </div>
  )
}
