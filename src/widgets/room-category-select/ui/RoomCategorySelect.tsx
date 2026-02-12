'use client'

import { CategoryItemType } from '@/entities/category'
import { CategorySelectList } from '@/features/levelup'

type RoomCategorySelectProps = {
  accessToken: string
  selectedCategory: CategoryItemType | null
  onCategorySelect: (category: CategoryItemType) => void
}

const HEADER_CLASSNAME = 'mt-5'
const TITLE_CLASSNAME = 'mr-auto ml-10 text-base font-semibold'
const DESCRIPTION_CLASSNAME = 'mr-auto ml-10 text-sm'
const LIST_WRAPPER_CLASSNAME =
  'bg-secondary mx-4 mt-4 flex max-h-[70vh] min-w-87.5 flex-col items-center justify-center overflow-hidden rounded-2xl p-4 overflow-x-auto'

export function RoomCategorySelect({
  accessToken,
  selectedCategory,
  onCategorySelect,
}: RoomCategorySelectProps) {
  return (
    <>
      <div className={HEADER_CLASSNAME}>
        <p className={TITLE_CLASSNAME}>어떤 카테고리로 대결하시겠어요?</p>
        <p className={DESCRIPTION_CLASSNAME}>카테고리를 선택해주세요.</p>
      </div>
      <div className={LIST_WRAPPER_CLASSNAME}>
        <CategorySelectList
          accessToken={accessToken}
          selectedCategoryId={selectedCategory ? selectedCategory.id : null}
          onCategorySelectId={onCategorySelect}
          variant="compact"
        />
      </div>
    </>
  )
}
