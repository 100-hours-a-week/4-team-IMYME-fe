'use client'

import { useCategoryList } from '../../filtering/model/useCategoryList'

import type { CategoryItemType } from '@/entities/category'

type CategorySelectListProps = {
  accessToken: string
  selectedCategoryId: number | null
  onCategorySelectId: (category: CategoryItemType) => void
  onClearKeyword: () => void
}

export function CategorySelectList({
  accessToken,
  selectedCategoryId,
  onCategorySelectId,
  onClearKeyword,
}: CategorySelectListProps) {
  const { data, isLoading, error } = useCategoryList(accessToken)
  const categories: CategoryItemType[] = data ?? []

  if (!accessToken) {
    return <p>카테고리를 불러오려면 로그인이 필요합니다.</p>
  }

  if (isLoading) {
    return <p>카테고리를 불러오는 중입니다.</p>
  }

  if (error) {
    return <p>카테고리를 불러오지 못했습니다.</p>
  }

  if (categories.length === 0) {
    return <p>카테고리 정보가 존재하지 않습니다.</p>
  }

  return (
    <div className="itmes-center grid min-h-0 w-full flex-1 grid-cols-2 place-items-center gap-6 overflow-y-auto">
      {categories.map((category) => {
        const isSelected = selectedCategoryId === category.id
        const selectedClassName = isSelected ? 'border border-secondary' : ''

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => {
              onCategorySelectId(category)
              onClearKeyword()
            }}
            className={`flex h-40 w-40 items-center justify-center overflow-auto rounded-2xl bg-white ${selectedClassName}`}
          >
            <p>{category.categoryName}</p>
          </button>
        )
      })}
    </div>
  )
}
