'use client'

import { useFilteringSelection } from '@/features/filtering'
import { MyCardList } from '@/features/my-card/MyCardList'
import { FilteringToolbar } from '@/widgets/filtering'
import { ProfileDashboard } from '@/widgets/profile'

export function MyPage() {
  const { selectedCategory, selectedKeyword, handleFilteringApply } = useFilteringSelection()

  return (
    <div className="w-full">
      <ProfileDashboard
        navigateToMyPage={false}
        showBackButton={true}
      />
      <div className="mt-5 grid w-full auto-cols-max grid-cols-2 items-center">
        <p className="mr-auto ml-10 text-base">내 카드</p>
      </div>
      <FilteringToolbar
        selectedCategory={selectedCategory}
        selectedKeyword={selectedKeyword}
        onApply={handleFilteringApply}
        showResetButton={false}
      />
      <MyCardList
        selectedCategory={selectedCategory}
        selectedKeyword={selectedKeyword}
      />
    </div>
  )
}
