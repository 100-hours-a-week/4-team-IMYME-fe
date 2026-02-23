import { useRouter } from 'next/navigation'
import { useState } from 'react'

type PvPRoomCreateExitGuardResult = {
  isExitAlertOpen: boolean
  handleBack: () => void
  handleExitConfirm: () => void
  handleExitCancel: () => void
  handleWaitingChange: (waiting: boolean) => void
  setIsExitAlertOpen: (open: boolean) => void
}

/* 
  PvP 룸 exit guard
  - 매칭 상대 대기 중이 아닐 때 -> 바로 뒤로 가기
  - 매칭 상대 대기 중 | 매칭 완료 시 -> 나가기 모달
    - 나가기 클릭 -> /pvp로 이동
    - 계속하기 클릭 -> 모달 꺼짐
*/
export function usePvPRoomCreateExitGuard(): PvPRoomCreateExitGuardResult {
  // 뒤로가기 모달 상태와 활성 여부
  const [isExitAlertOpen, setIsExitAlertOpen] = useState(false)
  const [isExitGuardActive, setIsExitGuardActive] = useState(false)
  const router = useRouter()

  const handleBack = () => {
    if (isExitGuardActive) {
      setIsExitAlertOpen(true)
      return
    }
    router.back()
  }

  const handleExitConfirm = () => {
    setIsExitAlertOpen(false)
    router.replace('/pvp')
  }

  const handleExitCancel = () => {
    setIsExitAlertOpen(false)
  }

  const handleWaitingChange = (waiting: boolean) => {
    // 매칭 진행/완료 여부를 Exit Guard에 반영
    setIsExitGuardActive(waiting)
  }

  return {
    isExitAlertOpen,
    handleBack,
    handleExitConfirm,
    handleExitCancel,
    handleWaitingChange,
    setIsExitAlertOpen,
  }
}
