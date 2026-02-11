'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { CategoryItemType } from '@/entities/category'
import { useAccessToken } from '@/features/auth'
import { ModeHeader, Field, FieldLabel, Input } from '@/shared'
import { RoomCategorySelect } from '@/widgets/room-category-select'
import { RoomCreateButton } from '@/widgets/room-create-button'
import { FieldDescription } from '@/shared/ui/field'

export function PvPRoomCreatePage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryItemType | null>(null)
  const [isNextClicked, setIsNextClicked] = useState<boolean | null>(null)
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
        <>
          <div className="mt-5">
            <p className="mr-auto ml-10 text-base">{selectedCategory?.categoryName} 카테고리</p>
          </div>
          <div className="flex h-full w-full flex-1 flex-col items-center justify-center">
            <Field className="mt-6 w-87.5 max-w-87.5">
              <FieldLabel
                htmlFor="roomName"
                className="text-base"
              >
                방 이름
              </FieldLabel>
              <Input
                id="roomName"
                placeholder="방 이름을 입력해주세요."
                className="border-secondary"
              />
              <FieldDescription>방 이름은 1자 이상 10자 이하로 입력해주세요.</FieldDescription>
              <FieldDescription>비방/욕설이 담긴 단어는 포함하실 수 없습니다.</FieldDescription>
            </Field>
          </div>
        </>
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
        disabled={isNextClicked === null ? !selectedCategory : false}
        onClick={() => setIsNextClicked(true)}
      />
    </div>
  )
}
