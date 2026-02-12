'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import type { CategoryItemType } from '@/entities/category'

const COMPLETE_DELAY_MS = 10_000

type UsePvPMatchingCreateFlowParams = {
  onExitGuardChange?: (isActive: boolean) => void
}

type UsePvPMatchingCreateFlowResult = {
  selectedCategory: CategoryItemType | null
  isNextClicked: boolean | null
  isWaiting: boolean
  isComplete: boolean
  roomName: string
  isCreateButtonDisabled: boolean
  createButtonVariant: 'category' | 'create' | 'waiting' | 'complete'
  handleCategorySelect: (category: CategoryItemType) => void
  handleRoomNameChange: (value: string) => void
  handleCreateButtonClick: () => void
}

export function usePvPMatchingCreateFlow({
  onExitGuardChange,
}: UsePvPMatchingCreateFlowParams): UsePvPMatchingCreateFlowResult {
  const [selectedCategory, setSelectedCategory] = useState<CategoryItemType | null>(null)
  const [isNextClicked, setIsNextClicked] = useState<boolean | null>(null)
  const [isWaiting, setIsWaiting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [roomName, setRoomName] = useState('')

  const router = useRouter()
  /*
  매칭 상대 10초 대기 후 매칭 완료 상태로 전환
  추후 소켓 적용 시 소켓 상태에 따라 전환 예정
  */
  useEffect(() => {
    if (!isWaiting) return

    const timerId = window.setTimeout(() => {
      setIsWaiting(false)
      setIsComplete(true)
    }, COMPLETE_DELAY_MS)

    return () => window.clearTimeout(timerId)
  }, [isWaiting])

  useEffect(() => {
    // 대기/완료 상태를 외부(Exit Guard)로 알림
    if (onExitGuardChange) {
      onExitGuardChange(isWaiting || isComplete)
    }
  }, [isComplete, isWaiting, onExitGuardChange])

  const hasSelectedCategory = Boolean(selectedCategory)
  const isCategoryStep = !isNextClicked

  // 현재 단계/상태에 맞는 버튼 variant 계산
  const createButtonVariant = useMemo(() => {
    if (isCategoryStep) return 'category'
    if (isComplete) return 'complete'
    if (isWaiting) return 'waiting'
    return 'create'
  }, [isCategoryStep, isComplete, isWaiting])

  // 카테고리 단계에서는 선택 여부, 방 이름 단계에서는 입력 여부로 버튼 비활성화
  const isFormInvalid = isCategoryStep ? !hasSelectedCategory : roomName.trim().length === 0
  // 매칭 대기/완료 상태에서는 버튼을 잠금
  const isMatchingLocked = createButtonVariant === 'waiting' || createButtonVariant === 'complete'
  const isCreateButtonDisabled = isFormInvalid || isMatchingLocked

  const handleCategorySelect = (category: CategoryItemType) => {
    // 동일 카테고리 재선택 시 해제
    setSelectedCategory((prev) => (prev?.id === category.id ? null : category))
  }

  const handleRoomNameChange = (value: string) => {
    setRoomName(value)
  }

  const handleCreateButtonClick = () => {
    // 카테고리 단계에서는 다음으로 이동
    if (!isNextClicked) {
      setIsNextClicked(true)
      return
    }
    // 방 생성 요청 → 대기 상태로 전환
    if (!isWaiting) {
      setIsWaiting(true)
    }

    if (isComplete) {
      router.replace('/pvp/matching/1')
    }
  }

  return {
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
  }
}
