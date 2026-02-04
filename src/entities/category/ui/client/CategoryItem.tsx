'use client'

import type { CategoryItemType } from '@/entities/category'

type CategoryRowProps = {
  category: CategoryItemType
  onClick: (category: CategoryItemType) => void
  isSelected?: boolean
}

export function CategoryItem({ category, onClick, isSelected = false }: CategoryRowProps) {
  const selectedClassName = isSelected ? ' w-full text-primary' : ''

  return (
    <div
      className={`cursor-pointer pt-2 ${selectedClassName}`}
      onClick={() => onClick(category)}
      role="button"
      tabIndex={0}
    >
      <p className="text-md ml-4 font-semibold">{category.categoryName}</p>
    </div>
  )
}
