'use client'

import { Button } from '@/shared'

import type { ReactNode } from 'react'

type MatchingSelectVariant = 'enter' | 'create'

type MatchingSelectButtonProps = {
  variant: MatchingSelectVariant
  icon: ReactNode
  trailingIcon?: ReactNode
  onClick?: () => void
}

const WRAPPER_CLASSNAME = 'flex h-full w-full items-center'
const TEXT_CLASSNAME = 'flex flex-1 flex-col items-start gap-2'

const LABEL_BY_VARIANT: Record<MatchingSelectVariant, { title: string; description: string }> = {
  enter: {
    title: '매칭 입장하기',
    description: '카테고리를 선택하고 대결에 참가하세요.',
  },
  create: {
    title: '매칭 만들기',
    description: '새로운 방을 만들고 상대방을 기다리세요.',
  },
}

export function MatchingSelectButton({
  variant,
  icon,
  trailingIcon,
  onClick,
}: MatchingSelectButtonProps) {
  const { title, description } = LABEL_BY_VARIANT[variant]

  return (
    <Button
      variant={'matching_method_btn'}
      onClick={onClick}
    >
      <div className={WRAPPER_CLASSNAME}>
        {icon}
        <div className={TEXT_CLASSNAME}>
          <p className="text-sm">{title}</p>
          <span className="text-xs">{description}</span>
        </div>
        {trailingIcon}
      </div>
    </Button>
  )
}
