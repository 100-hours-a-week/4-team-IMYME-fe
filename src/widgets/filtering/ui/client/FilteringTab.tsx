'use client'

import { CategoryItemType } from '@/entities/category'
import { KeywordItemType } from '@/entities/keyword'
import { useAccessToken } from '@/features/auth/model/client/useAuthStore'
import { CategoryList } from '@/features/filtering'
import { useCategoryList } from '@/features/filtering'
import { Button } from '@/shared/ui/button'
import {
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/ui/drawer'

const keywordData: KeywordItemType[] = [
  {
    id: 1,
    keywordName: 'Spring Bean',
  },
  {
    id: 2,
    keywordName: 'JPA',
  },
  {
    id: 3,
    keywordName: 'DI',
  },
  {
    id: 4,
    keywordName: 'Security Filter',
  },
]
export function FilteringTab() {
  const accessToken = useAccessToken()
  const categoryData = useCategoryList(accessToken)
  const handleCategoryClick = (category: CategoryItemType) => {
    console.log('Selected category', category)
  }

  return (
    <DrawerContent className="filtering-tab-frame">
      <DrawerHeader>
        <DrawerTitle>카테고리 선택</DrawerTitle>
        <DrawerDescription></DrawerDescription>
      </DrawerHeader>
      <div className="bg-secondary mt-0 mb-0 h-0.5 w-full"></div>
      <div className="flex h-full flex-1 pb-0">
        <CategoryList
          categories={categoryData}
          onCategoryClick={handleCategoryClick}
        />
        <div className="bg-secondary mx-3 min-h-full w-0.5"></div>
        <div className="h-full overflow-y-scroll">
          {keywordData.length > 0
            ? keywordData.map((keyword: KeywordItemType) => {
                return (
                  <div
                    key={keyword.id}
                    className="pt-2"
                  >
                    <p className="text-md ml-4 font-semibold">{keyword.keywordName}</p>
                  </div>
                )
              })
            : null}
        </div>
      </div>
      <DrawerFooter className="mt-0 flex items-center">
        <Button variant={'filter_btn'}>선택 완료</Button>
      </DrawerFooter>
    </DrawerContent>
  )
}
