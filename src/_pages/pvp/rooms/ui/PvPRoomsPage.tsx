'use client'
import { useRouter } from 'next/navigation'

import { useFilteringSelection } from '@/features/filtering'
import { RoomList } from '@/features/rooms'
import { ModeHeader } from '@/shared'
import { FilteringToolbar } from '@/widgets/filtering'

export function PvPRoomsPage() {
  const router = useRouter()
  const { selectedCategory, selectedKeyword, handleFilteringApply } = useFilteringSelection()
  const handleBack = () => {
    router.back()
  }
  return (
    <div className="h-full w-full">
      <ModeHeader
        mode="pvp"
        step="matching_enter"
        onBack={handleBack}
      />
      <div className="mt-5 grid w-full auto-cols-max grid-cols-2 items-center">
        <p className="mr-auto ml-10 text-base">참여 가능한 매칭 방</p>
      </div>
      <FilteringToolbar
        selectedCategory={selectedCategory}
        selectedKeyword={selectedKeyword}
        onApply={handleFilteringApply}
        showResetButton={false}
        variant="category"
      />
      <RoomList />
    </div>
  )
}
