'use client'

import { ArrowRight } from 'lucide-react'

import { Button } from '@/shared'

type RoomProps = {
  title: string
  category: string
  participantsLabel: string
  hostName: string
  onEnter?: () => void
}

const CARD_CLASSNAME =
  'border-secondary flex h-30 w-80 flex-col items-center justify-center gap-5 rounded-xl border'
const HEADER_ROW_CLASSNAME = 'flex w-full items-start justify-between px-4 pt-2'
const HOST_ROW_CLASSNAME = 'flex w-full items-center justify-between'
const HOST_INFO_CLASSNAME = 'flex items-center gap-2 pl-4'
const HOST_AVATAR_CLASSNAME = 'h-8 w-8 rounded-full bg-gray-300'
const ENTER_ICON_SIZE = 16

export function Room({ title, category, participantsLabel, hostName, onEnter }: RoomProps) {
  return (
    <div className={CARD_CLASSNAME}>
      <div className={HEADER_ROW_CLASSNAME}>
        <div className="items-start">
          <p className="font-semibold">{title}</p>
          <p className="text-xs">{category}</p>
        </div>
        <p className="text-sm">{participantsLabel}</p>
      </div>
      <div className={HOST_ROW_CLASSNAME}>
        <div className={HOST_INFO_CLASSNAME}>
          <div className={HOST_AVATAR_CLASSNAME}></div>
          <p className="text-sm">{hostName}</p>
        </div>
        <Button
          variant="pvp_room_enter_btn"
          onClick={onEnter}
        >
          <p className="text-sm">입장하기</p>
          <ArrowRight size={ENTER_ICON_SIZE} />
        </Button>
      </div>
    </div>
  )
}
