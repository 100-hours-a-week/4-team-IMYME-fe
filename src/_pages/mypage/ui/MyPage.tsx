import { SlidersVertical } from 'lucide-react'

import { Drawer, DrawerTrigger } from '@/shared/ui/drawer'
import { FilteringTab } from '@/widgets/filtering'
import { ProfileDashboard } from '@/widgets/profile'

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
          <FilteringTab />
        </Drawer>
      </div>
    </div>
  )
}
