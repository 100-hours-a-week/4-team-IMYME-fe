'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { CategoryItemType } from '@/entities/category'
import { useAccessToken } from '@/features/auth'
import { ModeHeader } from '@/shared'
import { RoomCategorySelect } from '@/widgets/room-category-select'
import { RoomCreateButton } from '@/widgets/room-create-button'
import { RoomNameSetting } from '@/widgets/room-name-setting'

export function PvPRoomCreatePage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryItemType | null>(null)
  const [isNextClicked, setIsNextClicked] = useState<boolean | null>(null)
  const [roomName, setRoomName] = useState('')
  const router = useRouter()
  const accessToken = useAccessToken()

  const handleBack = () => {
    router.back()
  }
  return (
    <div className="flex h-full w-full flex-col">
      <ModeHeader
        mode="pvp"
        step="matching_create"
        onBack={handleBack}
      />
      {isNextClicked ? (
        <RoomNameSetting
          selectedCategoryName={selectedCategory?.categoryName}
          roomName={roomName}
          onRoomNameChange={setRoomName}
        />
      ) : (
        <RoomCategorySelect
          accessToken={accessToken}
          selectedCategory={selectedCategory}
          onCategorySelect={(category) => {
            setSelectedCategory((prev) => (prev?.id === category.id ? null : category))
          }}
        />
      )}
      <RoomCreateButton
        variant={isNextClicked === null ? 'category' : 'create'}
        disabled={isNextClicked === null ? !selectedCategory : roomName.trim().length === 0}
        onClick={() => setIsNextClicked(true)}
      />
    </div>
  )
}
