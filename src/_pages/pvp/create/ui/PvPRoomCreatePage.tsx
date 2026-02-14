'use client'

import { usePvPRoomCreateExitGuard } from '@/features/pvp'
import { ModeHeader } from '@/shared'
import { PvPMatchingCreate } from '@/widgets/pvp-matching-create'

export function PvPRoomCreatePage() {
  const {
    isExitAlertOpen,
    handleBack,
    handleExitCancel,
    handleExitConfirm,
    handleWaitingChange,
    setIsExitAlertOpen,
  } = usePvPRoomCreateExitGuard()

  return (
    <div className="flex w-full flex-1 flex-col">
      <ModeHeader
        mode="pvp"
        step="matching_create"
        onBack={handleBack}
      />
      <PvPMatchingCreate
        onExitGuardChange={handleWaitingChange}
        isExitAlertOpen={isExitAlertOpen}
        onExitAlertOpenChange={setIsExitAlertOpen}
        onExitConfirm={handleExitConfirm}
        onExitCancel={handleExitCancel}
      />
    </div>
  )
}
