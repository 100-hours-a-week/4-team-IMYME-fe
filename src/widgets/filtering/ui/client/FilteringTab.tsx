'use client'

import { useState } from 'react'

import { KeywordItemType } from '@/entities/keyword'
import { useAccessToken } from '@/features/auth/model/client/useAuthStore'
import { CategoryList, KeywordList, useCategoryList, useKeywordList } from '@/features/filtering'
import { Button } from '@/shared/ui/button'
import {
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/ui/drawer'

export function FilteringTab() {
  const accessToken = useAccessToken()
  const {
    data: categoryData = [],
    isLoading: categoryLoading,
    error: categoryError,
  } = useCategoryList(accessToken)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const {
    data: keywordData = [],
    isLoading: keywordLoading,
    error: keywordError,
  } = useKeywordList({
    accessToken,
    categoryId: selectedCategoryId,
  })

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategoryId(categoryId)
  }
  const handleKeywordClick = (keyword: KeywordItemType) => {
    console.log('Selected Keyword', keyword)
  }

  return (
    <DrawerContent className="filtering-tab-frame">
      <DrawerHeader>
        <DrawerTitle>카테고리 선택</DrawerTitle>
        <DrawerDescription></DrawerDescription>
      </DrawerHeader>
      <div className="bg-secondary mt-0 mb-0 h-0.5 w-full"></div>
      <div className="flex h-full flex-1 pb-0">
        <CategoryList
          isLoading={categoryLoading}
          error={categoryError}
          categories={categoryData}
          onCategoryClick={handleCategoryClick}
        />
        <div className="bg-secondary mx-3 min-h-full w-0.5"></div>
        <div className="h-full overflow-y-scroll">
          {keywordData.length > 0 ? (
            <KeywordList
              isLoading={keywordLoading}
              error={keywordError}
              keywords={keywordData}
              onKeywordClick={handleKeywordClick}
            />
          ) : (
            <p className="text-center">카테고리를 선택해 주세요.</p>
          )}
        </div>
      </div>
      <DrawerFooter className="mt-0 flex items-center">
        <Button variant={'filter_btn'}>선택 완료</Button>
      </DrawerFooter>
    </DrawerContent>
  )
}
