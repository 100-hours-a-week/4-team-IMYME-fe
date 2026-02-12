'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/shared'

type RoomCreateButtonVariant = 'category' | 'create' | 'waiting' | 'complete'

type RoomCreateButtonProps = {
  variant: RoomCreateButtonVariant
  disabled?: boolean
  onClick?: () => void
}

const LABEL_BY_VARIANT: Record<RoomCreateButtonVariant, string> = {
  category: '다음',
  create: '방 만들기',
  waiting: '매칭 대기 중',
  complete: '곧 대결이 시작됩니다.',
}

const WRAPPER_CLASSNAME = 'mt-auto mb-4 flex w-full justify-center pb-6'
const BUTTON_CLASSNAME = 'bg-secondary h-10 w-87.5 max-w-87.5'

export function RoomCreateButton({ variant, disabled, onClick }: RoomCreateButtonProps) {
  const [currentVariant, setCurrentVariant] = useState<RoomCreateButtonVariant>(variant)

  useEffect(() => {
    setCurrentVariant(variant)
  }, [variant])

  const handleClick = () => {
    if (currentVariant === 'create') {
      setCurrentVariant('waiting')
    }
    if (onClick) {
      onClick()
    }
  }

  return (
    <div className={WRAPPER_CLASSNAME}>
      <Button
        className={BUTTON_CLASSNAME}
        disabled={disabled || currentVariant === 'complete'}
        onClick={handleClick}
      >
        {LABEL_BY_VARIANT[currentVariant]}
      </Button>
    </div>
  )
}
