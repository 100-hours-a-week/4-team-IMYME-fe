'use client'

import { useProfile } from '@/entities/user'
import { useAccessToken } from '@/features/auth'
import {
  PvPMatchingWaiting,
  RoomCategorySelect,
  RoomCreateButton,
  RoomNameSetting,
  usePvPMatchingCreateFlow,
} from '@/features/pvp'
import { AlertModal } from '@/shared'

type PvPMatchingCreateProps = {
  onExitGuardChange?: (isActive: boolean) => void
  isExitAlertOpen?: boolean
  onExitAlertOpenChange?: (open: boolean) => void
  onExitConfirm?: () => void
  onExitCancel?: () => void
}

export function PvPMatchingCreate({
  onExitGuardChange,
  isExitAlertOpen,
  onExitAlertOpenChange,
  onExitConfirm,
  onExitCancel,
}: PvPMatchingCreateProps) {
  const accessToken = useAccessToken()
  const profile = useProfile()

  // 매칭 생성 플로우 상태/핸들러(카테고리 선택 → 방 생성 → 대기/완료)
  const {
    selectedCategory,
    isNextClicked,
    isWaiting,
    isComplete,
    roomName,
    isCreateButtonDisabled,
    createButtonVariant,
    handleCategorySelect,
    handleRoomNameChange,
    handleCreateButtonClick,
  } = usePvPMatchingCreateFlow({ onExitGuardChange })

  // 단계 분기 (카테고리 선택 단계 여부)
  const isCategoryStep = isNextClicked === null

  // 매칭 상태 표시 여부 (대기 또는 완료)
  const shouldShowMatchingStatus = isWaiting || isComplete

  return (
    <div className="flex w-full flex-1 flex-col">
      {isCategoryStep ? (
        <RoomCategorySelect
          accessToken={accessToken}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
      ) : (
        <>
          <RoomNameSetting
            selectedCategoryName={selectedCategory?.categoryName}
            roomName={roomName}
            onRoomNameChange={handleRoomNameChange}
            disabled={isWaiting || isComplete}
          />
          {shouldShowMatchingStatus ? (
            <PvPMatchingWaiting
              leftProfile={{
                name: profile.nickname,
                avatarUrl: profile.profileImageUrl,
              }}
              rightProfile={{ name: '...' }}
              showSpinner={!isComplete}
            />
          ) : null}
        </>
      )}
      <RoomCreateButton
        variant={createButtonVariant}
        disabled={isCreateButtonDisabled}
        onClick={handleCreateButtonClick}
      />
      <AlertModal
        open={isExitAlertOpen}
        onOpenChange={onExitAlertOpenChange}
        title={'매칭을 취소하시겠습니까?'}
        description={'현재 진행 중인 매칭이 취소됩니다.'}
        action={'나가기'}
        cancel={'계속하기'}
        onAction={onExitConfirm}
        onCancel={onExitCancel}
      />
    </div>
  )
}
