'use client'

import { useState } from 'react'

import { CategoryItemType } from '@/entities/category'
import { KeywordItemType } from '@/entities/keyword'
import { useAccessToken } from '@/features/auth'
import {
  CategoryList,
  KeywordList,
  useCategoryList,
  useKeywordList,
  FilteringCondition,
} from '@/features/filtering'
import {
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Button,
} from '@/shared'

type FilteringSelection = {
  category: CategoryItemType | null
  keyword: KeywordItemType | null
}

type FilteringTabProps = {
  variant?: 'category' | 'keyword'
  onApply?: (selection: FilteringSelection) => void
  onClose?: () => void
}

export function FilteringTab({ variant = 'keyword', onApply, onClose }: FilteringTabProps) {
  const accessToken = useAccessToken()
  const {
    data: categoryData = [],
    isLoading: categoryLoading,
    error: categoryError,
  } = useCategoryList(accessToken)
  const [selectedCategory, setSelectedCategory] = useState<CategoryItemType | null>(null)
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordItemType | null>(null)
  const {
    data: keywordData = [],
    isLoading: keywordLoading,
    error: keywordError,
  } = useKeywordList({
    categoryId: selectedCategory?.id ?? null,
    accessToken,
  })
  const isCategoryOnly = variant === 'category'

  const handleCategoryClick = (category: CategoryItemType) => {
    setSelectedCategory(category)
    if (selectedKeyword) setSelectedKeyword(null)

    if (isCategoryOnly && onApply) {
      onApply({
        category,
        keyword: null,
      })
      if (onClose) onClose()
    }
  }
  const handleKeywordClick = (keyword: KeywordItemType) => {
    setSelectedKeyword(keyword)
  }

  const handleInitButtonClick = () => {
    if (selectedCategory) setSelectedCategory(null)
    if (selectedKeyword) setSelectedKeyword(null)

    if (onApply) {
      onApply({
        category: null,
        keyword: null,
      })
    }
    if (onClose) onClose()
  }

  const handleApplyClick = () => {
    if (!onApply) return

    onApply({
      category: selectedCategory,
      keyword: selectedKeyword,
    })
    if (onClose) onClose()
  }

  return (
    <DrawerContent className="filtering-tab-frame h-50vh flex-col">
      <DrawerHeader>
        <DrawerTitle>카테고리 선택</DrawerTitle>
        <DrawerDescription></DrawerDescription>
        <FilteringCondition
          selectedCategory={selectedCategory}
          selectedKeyword={selectedKeyword}
          onReset={handleInitButtonClick}
        />
      </DrawerHeader>
      <div className="bg-secondary mt-0 mb-0 h-0.5 w-full"></div>
      <div className={isCategoryOnly ? 'flex min-h-0 justify-center pb-0' : 'flex min-h-0 pb-0'}>
        <div className={isCategoryOnly ? 'min-h-0 w-full text-center' : 'min-h-0'}>
          <CategoryList
            isLoading={categoryLoading}
            error={categoryError}
            categories={categoryData}
            onCategoryClick={handleCategoryClick}
            selectedCategoryId={selectedCategory ? selectedCategory.id : null}
          />
        </div>
        {isCategoryOnly ? null : (
          <>
            <div className="bg-secondary min-h-full w-0.5"></div>
            <div className="flex min-h-0 flex-1">
              {keywordData.length > 0 ? (
                <KeywordList
                  isLoading={keywordLoading}
                  error={keywordError}
                  keywords={keywordData}
                  onKeywordClick={handleKeywordClick}
                  selectedKeywordId={selectedKeyword ? selectedKeyword.id : null}
                />
              ) : (
                <div className="pt-2">
                  <p className="text-md ml-4 font-semibold">카테고리를 선택해 주세요.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <DrawerFooter className="mt-auto flex items-center">
        <Button
          variant={'filter_btn'}
          onClick={handleApplyClick}
        >
          선택 완료
        </Button>
      </DrawerFooter>
    </DrawerContent>
  )
}
