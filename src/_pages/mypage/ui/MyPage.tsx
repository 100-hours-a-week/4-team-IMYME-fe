import { SlidersVertical } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/ui/drawer'
import { ProfileDashboard } from '@/widgets/profile'

const categoryData = [
  { id: 1, categoryName: 'Spring' },
  { id: 2, categoryName: 'React' },
  { id: 3, categoryName: '네트워크' },
  { id: 4, categoryName: '운영체제' },
  { id: 5, categoryName: '자료구조' },
  { id: 6, categoryName: '데이터베이스' },
  { id: 7, categoryName: '컴퓨터구조' },
  { id: 8, categoryName: '알고리즘' },
  { id: 9, categoryName: 'Web' },
]

export function MyPage() {
  return (
    <div className="w-full">
      <ProfileDashboard
        navigateToMyPage={false}
        showBackButton={true}
      />
      <div className="mt-5 grid w-full auto-cols-max grid-cols-2 items-center">
        <p className="mr-auto ml-10 text-base">내 카드</p>
      </div>
      <div>
        <Drawer>
          <DrawerTrigger className="mr-10 ml-auto flex items-center gap-1">
            <SlidersVertical size={18} />
            <p className="text-sm">필터</p>
          </DrawerTrigger>
          <DrawerContent className="filtering-tab-frame">
            <DrawerHeader>
              <DrawerTitle>카테고리 선택</DrawerTitle>
            </DrawerHeader>
            <div className="bg-secondary mt-0 mb-0 h-0.5 w-full"></div>
            <div className="flex h-full flex-1 pb-0">
              <div
                className="h-full overflow-y-scroll"
                // style={{ maxHeight: CATEGORY_LIST_MAX_HEIGHT_PX }}
              >
                {categoryData.map((category) => {
                  return (
                    <div
                      key={category.id}
                      className="pt-2"
                    >
                      <p className="text-md ml-4 font-semibold">{category.categoryName}</p>
                    </div>
                  )
                })}
              </div>
              <div className="bg-secondary mx-3 min-h-full w-0.5"></div>
            </div>
            <DrawerFooter className="mt-0 flex items-center">
              <Button variant={'filter_btn'}>선택 완료</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}
