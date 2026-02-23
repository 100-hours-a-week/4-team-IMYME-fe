'use client'

import { useState } from 'react'

import { useFilteringSelection } from '@/features/filtering'
import { MyCardList } from '@/features/my-card'
import { MyPvPCardList } from '@/features/my-pvp-card'
import { FilteringToolbar } from '@/widgets/filtering'
import { ListTabs } from '@/widgets/my-page'
import { ProfileDashboard } from '@/widgets/profile'

export function MyPage() {
  const isPvpOpen = process.env.NEXT_PUBLIC_PVP_OPEN === 'true'
  const [activeList, setActiveList] = useState<'learning' | 'pvp'>('learning')
  const { selectedCategory, selectedKeyword, handleFilteringApply } = useFilteringSelection()

  return (
    <div className="mb-5 h-full w-full">
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
        variant="keyword"
      />
      <div className="bg-secondary mt-2 h-px w-full"></div>
      <ListTabs
        activeList={activeList}
        onChange={setActiveList}
      />
      {activeList === 'learning' || !isPvpOpen ? (
        <MyCardList
          selectedCategory={selectedCategory}
          selectedKeyword={selectedKeyword}
        />
      ) : (
        <MyPvPCardList />
      )}
    </div>
  )
}
