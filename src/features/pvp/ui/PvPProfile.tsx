'use client'

import { Avatar } from '@/entities/user'

type PvPProfileProps = {
  name: string
  avatarUrl?: string
}

const WRAPPER_CLASSNAME = 'flex flex-col items-center justify-center gap-2'
const AVATAR_SIZE_PX = 60

export function PvPProfile({ name, avatarUrl }: PvPProfileProps) {
  return (
    <div className={WRAPPER_CLASSNAME}>
      <Avatar
        avatar_src={avatarUrl ?? ''}
        size={AVATAR_SIZE_PX}
      />
      <p>{name}</p>
    </div>
  )
}
