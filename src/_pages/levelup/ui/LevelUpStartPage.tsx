'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { CategoryItemType } from '@/entities/category'
import { useAccessToken } from '@/features/auth/model/client/useAuthStore'
import { CardNameModal, CategorySelectList, KeywordSelectList } from '@/features/levelup'
import { createCard } from '@/features/levelup/api/createCard'
import { createAttempt } from '@/features/record'
import { LevelUpHeader } from '@/shared'

import type { KeywordItemType } from '@/entities/keyword'
const STEP_ONE_PROGRESS_VALUE = 33
const STEP_TWO_PROGRESS_VALUE = 66
const STEP_ONE_LABEL = '1/3'
const STEP_TWO_LABEL = '2/3'
const INITIAL_ATTEMPT_DURATION_SECONDS = 0

export function LevelUpStartPage() {
  const router = useRouter()
  const accessToken = useAccessToken()
  const [selectedCategory, setSelectedCategory] = useState<CategoryItemType | null>(null)
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordItemType | null>(null)
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false)

  const hasSelectedCategory = selectedCategory !== null
  const progressValue = hasSelectedCategory ? STEP_TWO_PROGRESS_VALUE : STEP_ONE_PROGRESS_VALUE
  const progressLabel = hasSelectedCategory ? STEP_TWO_LABEL : STEP_ONE_LABEL

  const handleKeywordSelect = (keyword: KeywordItemType) => {
    setSelectedKeyword(keyword)
    setIsNameDialogOpen(true)
  }

  const handleConfirmCardName = async (title: string) => {
    if (!selectedCategory || !selectedKeyword) return

    const response = await createCard(accessToken, {
      categoryId: selectedCategory.id,
      keywordId: selectedKeyword.id,
      title,
    })

    const createdCardId = response?.data?.id
    if (!createdCardId) return

    const attemptResponse = await createAttempt(
      accessToken,
      createdCardId,
      INITIAL_ATTEMPT_DURATION_SECONDS,
    )
    if (!attemptResponse.ok) return

    const attemptId = attemptResponse.data?.attemptId
    const attemptNo = attemptResponse.data?.attemptNo
    if (!attemptId) return

    setIsNameDialogOpen(false)
    router.replace(
      `/levelup/record?cardId=${createdCardId}&attemptId=${attemptId}&attemptNo=${attemptNo}`,
    )
  }

  const handleBack = () => {
    if (selectedKeyword) {
      setSelectedKeyword(null)
      return
    }

    if (selectedCategory) {
      setSelectedCategory(null)
      return
    }

    router.back()
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
      <CardNameModal
        open={isNameDialogOpen}
        onOpenChange={setIsNameDialogOpen}
        selectedCategoryName={selectedCategory?.categoryName ?? null}
        selectedKeywordName={selectedKeyword?.keywordName ?? null}
        onCancel={() => {
          setSelectedKeyword(null)
          setIsNameDialogOpen(false)
        }}
        onConfirm={handleConfirmCardName}
      />
    </div>
  )
}
