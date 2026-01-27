'use client'
import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'

import { KeywordItemType } from '@/entities/keyword'
import { useAccessToken } from '@/features/auth/model/client/useAuthStore'
import { CategorySelectList, KeywordSelectList, useKeywordList } from '@/features/filtering'

import { ProgressField } from './ProgressField'

const STEP_ONE_PROGRESS_VALUE = 33
const STEP_TWO_PROGRESS_VALUE = 66
const STEP_ONE_LABEL = '1/3'
const STEP_TWO_LABEL = '2/3'

export function LevelUpStartPage() {
  const accessToken = useAccessToken()
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordItemType | null>(null)

  const { data: keywords = [] } = useKeywordList({
    accessToken,
    categoryId: selectedCategoryId,
  })

  const progressValue = selectedCategoryId ? STEP_TWO_PROGRESS_VALUE : STEP_ONE_PROGRESS_VALUE
  const progressLabel = selectedCategoryId ? STEP_TWO_LABEL : STEP_ONE_LABEL

  const handleCategorySelect = (category: { id: number }) => {
    setSelectedCategoryId(category.id)
    if (selectedKeyword) setSelectedKeyword(null)
  }

  return (
    <>
      <div className="flex gap-3">
        <div className="bg-secondary ml-4 flex h-10 w-10 items-center justify-center rounded-full">
          <ChevronLeft
            size={30}
            className="text-primary"
          />
        </div>
        <div className="flex flex-col items-start">
          <p className="font-semibold">레벨업 모드</p>
          <p className="text-sm">카테고리 선택</p>
        </div>
      </div>
      <div className="px-6">
        <ProgressField
          value={progressValue}
          stepLabel={progressLabel}
        />
      </div>
      <div className="bg-secondary mx-4 mt-4 flex h-full max-w-350 flex-col items-center justify-center overflow-y-scroll rounded-2xl py-4">
        {selectedCategoryId ? (
          <KeywordSelectList
            keywords={keywords}
            selectedKeywordId={selectedKeyword ? selectedKeyword.id : null}
            onKeywordSelect={setSelectedKeyword}
          />
        ) : (
          <CategorySelectList
            accessToken={accessToken}
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={handleCategorySelect}
          />
        )}
      </div>
    </>
  )
}
