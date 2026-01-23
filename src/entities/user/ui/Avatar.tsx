import Image from 'next/image'

import { DefaultAvatar } from '@/shared'

interface AvatarProps {
  avatar_src: string
  size: number
}

export function Avatar({ avatar_src, size }: AvatarProps) {
  return (
    <Image
      src={avatar_src ? avatar_src : DefaultAvatar}
      alt="profile image"
      width={size}
      height={size}
      className="rounded-full object-cover"
      loading="eager"
    />
  )
}
