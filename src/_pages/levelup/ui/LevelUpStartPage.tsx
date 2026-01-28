'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { CategoryItemType } from '@/entities/category'
import { useAccessToken } from '@/features/auth/model/client/useAuthStore'
import { CategorySelectList, KeywordSelectList } from '@/features/levelup'
import { LevelUpHeader } from '@/features/levelup'

import type { KeywordItemType } from '@/entities/keyword'

const STEP_ONE_PROGRESS_VALUE = 33
const STEP_TWO_PROGRESS_VALUE = 66
const STEP_ONE_LABEL = '1/3'
const STEP_TWO_LABEL = '2/3'

export function LevelUpStartPage() {
  const router = useRouter()
  const accessToken = useAccessToken()
  const [selectedCategory, setSelectedCategory] = useState<CategoryItemType | null>(null)
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordItemType | null>(null)

  const hasSelectedCategory = selectedCategory !== null
  const progressValue = hasSelectedCategory ? STEP_TWO_PROGRESS_VALUE : STEP_ONE_PROGRESS_VALUE
  const progressLabel = hasSelectedCategory ? STEP_TWO_LABEL : STEP_ONE_LABEL

  const handleKeywordSelect = (keyword: KeywordItemType) => {
    setSelectedKeyword(keyword)
    router.push('/levelup/record')
    setSelectedCategory(null)
    setSelectedKeyword(null)
  }

  const handleBack = () => {
    if (!selectedCategory?.id || (selectedCategory && !selectedKeyword)) {
      setSelectedCategory(null)
      router.back()
      return
    }

    setSelectedCategory(null)
    setSelectedKeyword(null)
  }

  return (
    <div className="h-full w-full">
      <LevelUpHeader
        variant={hasSelectedCategory ? 'keyword' : 'category'}
        onBack={handleBack}
        progressValue={progressValue}
        stepLabel={progressLabel}
      />
      <div className="bg-secondary mx-4 mt-4 flex max-h-[80vh] max-w-350 flex-col items-center justify-center overflow-hidden rounded-2xl p-4">
        {hasSelectedCategory ? (
          <KeywordSelectList
            accessToken={accessToken}
            categoryId={selectedCategory ? selectedCategory.id : null}
            selectedKeywordId={selectedKeyword ? selectedKeyword.id : null}
            onKeywordSelect={handleKeywordSelect}
          />
        ) : (
          <CategorySelectList
            accessToken={accessToken}
            selectedCategoryId={selectedCategory ? selectedCategory : null}
            onCategorySelectId={setSelectedCategory}
            onClearKeyword={() => setSelectedKeyword(null)}
          />
        )}
      </div>
    </div>
  )
}
