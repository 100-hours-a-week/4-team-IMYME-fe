'use client'

import { ChevronRight, RotateCcw } from 'lucide-react'
import { useState } from 'react'

import { CategoryItemType } from '@/entities/category'
import { KeywordItemType } from '@/entities/keyword'
import { useAccessToken } from '@/features/auth/model/client/useAuthStore'
import { CategoryList, KeywordList, useCategoryList, useKeywordList } from '@/features/filtering'
import { Button } from '@/shared/ui/button'
import { DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/shared/ui/drawer'

export function FilteringTab() {
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
    accessToken,
    categoryId: selectedCategory ? selectedCategory.id : null,
  })

  const handleCategoryClick = (category: CategoryItemType) => {
    setSelectedCategory(category)
    if (selectedKeyword) setSelectedKeyword(null)
  }
  const handleKeywordClick = (keyword: KeywordItemType) => {
    setSelectedKeyword(keyword)
  }

  const handleInitButtonClick = () => {
    if (selectedCategory) setSelectedCategory(null)
    if (selectedKeyword) setSelectedKeyword(null)
  }

  return (
    <DrawerContent className="filtering-tab-frame">
      <DrawerHeader>
        <DrawerTitle>카테고리 선택</DrawerTitle>
        <div className="flex min-h-5 items-center gap-1">
          {selectedCategory ? selectedCategory.categoryName : ''}
          {selectedKeyword ? (
            <>
              <ChevronRight size={16} />
              {selectedKeyword.keywordName}
            </>
          ) : (
            ''
          )}
          <div
            className="ml-auto flex items-center gap-2"
            onClick={handleInitButtonClick}
          >
            필터 초기화
            <RotateCcw size={16} />
          </div>
        </div>
      </DrawerHeader>
      <div className="bg-secondary mt-0 mb-0 h-0.5 w-full"></div>
      <div className="flex h-full flex-1 pb-0">
        <CategoryList
          isLoading={categoryLoading}
          error={categoryError}
          categories={categoryData}
          onCategoryClick={handleCategoryClick}
          selectedCategoryId={selectedCategory ? selectedCategory.id : null}
        />
        <div className="bg-secondary ml-2 min-h-full w-0.5"></div>
        <div className="h-full overflow-y-scroll">
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
      </div>
      <DrawerFooter className="mt-0 flex items-center">
        <Button variant={'filter_btn'}>선택 완료</Button>
      </DrawerFooter>
    </DrawerContent>
  )
}
