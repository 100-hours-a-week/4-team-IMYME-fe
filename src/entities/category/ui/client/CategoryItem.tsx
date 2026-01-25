'use client'

import type { CategoryItemType } from '@/entities/category'

type CategoryRowProps = {
  category: CategoryItemType
  onClick: (category: CategoryItemType) => void
}

export function CategoryItem({ category, onClick }: CategoryRowProps) {
  return (
    <div
      className="pt-2"
      onClick={() => onClick(category)}
      role="button"
      tabIndex={0}
    >
      <p className="text-md ml-4 font-semibold">{category.categoryName}</p>
    </div>
  )
}
