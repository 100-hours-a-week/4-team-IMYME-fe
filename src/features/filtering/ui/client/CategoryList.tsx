'use client'

import { CategoryItem, CategoryItemType } from '@/entities/category'

type CategoryListProps = {
  categories: CategoryItemType[]
  onCategoryClick: (category: CategoryItemType) => void
}

export function CategoryList({ categories, onCategoryClick }: CategoryListProps) {
  return (
    <div className="h-full overflow-y-scroll">
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          onClick={onCategoryClick}
        />
      ))}
    </div>
  )
}
