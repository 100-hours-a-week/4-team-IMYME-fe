'use client'

import { Room } from '@/entities/room'

const LIST_CLASSNAME = 'mt-5 flex w-full flex-col items-center justify-center gap-4'

export function RoomList() {
  return (
    <div className={LIST_CLASSNAME}>
      <Room
        title="드루와"
        category="컴퓨터구조"
        participantsLabel="1/2"
        hostName="폰노이만의 후예"
      />
    </div>
  )
}
