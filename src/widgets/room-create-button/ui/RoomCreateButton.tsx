'use client'

import { Button } from '@/shared'

type RoomCreateButtonVariant = 'category' | 'create'

type RoomCreateButtonProps = {
  variant: RoomCreateButtonVariant
  disabled?: boolean
  onClick?: () => void
}

const LABEL_BY_VARIANT: Record<RoomCreateButtonVariant, string> = {
  category: '다음',
  create: '방 만들기',
}

const WRAPPER_CLASSNAME = 'mt-6 mb-4 flex w-full justify-center'
const BUTTON_CLASSNAME = 'bg-secondary h-10 w-87.5 max-w-350 mt-auto'

export function RoomCreateButton({ variant, disabled, onClick }: RoomCreateButtonProps) {
  return (
    <div className={WRAPPER_CLASSNAME}>
      <Button
        className={BUTTON_CLASSNAME}
        disabled={disabled}
        onClick={onClick}
      >
        {LABEL_BY_VARIANT[variant]}
      </Button>
    </div>
  )
}
