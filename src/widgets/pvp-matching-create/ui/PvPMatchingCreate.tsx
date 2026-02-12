'use client'

import { useState } from 'react'

import { useProfile } from '@/entities/user'
import { useAccessToken } from '@/features/auth'
import {
  PvPMatchingWaiting,
  RoomCategorySelect,
  RoomCreateButton,
  RoomNameSetting,
} from '@/features/pvp'

import type { CategoryItemType } from '@/entities/category'

const WRAPPER_CLASSNAME = 'flex h-full w-full flex-1 flex-col'

export function PvPMatchingCreate() {
  const accessToken = useAccessToken()
  const profile = useProfile()

  const [selectedCategory, setSelectedCategory] = useState<CategoryItemType | null>(null)
  const [isNextClicked, setIsNextClicked] = useState<boolean | null>(null)
  const [isWaiting, setIsWaiting] = useState(false)
  const [roomName, setRoomName] = useState('')

  return (
    <div className={WRAPPER_CLASSNAME}>
      {isNextClicked ? (
        <>
          <RoomNameSetting
            selectedCategoryName={selectedCategory?.categoryName}
            roomName={roomName}
            onRoomNameChange={setRoomName}
            disabled={isWaiting}
          />
          {isWaiting ? (
            <PvPMatchingWaiting
              leftProfile={{
                name: profile.nickname,
                avatarUrl: profile.profileImageUrl,
              }}
              rightProfile={{ name: '...' }}
            />
          ) : null}
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
        variant={isNextClicked === null ? 'category' : isWaiting ? 'waiting' : 'create'}
        disabled={isNextClicked === null ? !selectedCategory : roomName.trim().length === 0}
        onClick={() => {
          if (isNextClicked === null) {
            setIsNextClicked(true)
            return
          }
          if (!isWaiting) {
            setIsWaiting(true)
          }
        }}
      />
    </div>
  )
}
