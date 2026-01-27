'use client'

import { useCategoryList } from '../../model/useCategoryList'

import type { CategoryItemType } from '@/entities/category'

type CategorySelectListProps = {
  accessToken: string
  selectedCategoryId: number | null
  onCategorySelect: (category: CategoryItemType) => void
}

export function CategorySelectList({
  accessToken,
  selectedCategoryId,
  onCategorySelect,
}: CategorySelectListProps) {
  const { data: categories = [], isLoading, error } = useCategoryList(accessToken)

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
    <div className="itmes-center grid grid-cols-2 gap-6">
      {categories.map((category) => {
        const isSelected = selectedCategoryId === category.id
        const selectedClassName = isSelected ? 'border border-secondary' : ''

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategorySelect(category)}
            className={`flex h-40 w-40 items-center justify-center overflow-auto rounded-2xl bg-white ${selectedClassName}`}
          >
            <p>{category.categoryName}</p>
          </button>
        )
      })}
    </div>
  )
}
