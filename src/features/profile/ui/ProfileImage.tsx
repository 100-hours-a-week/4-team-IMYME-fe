import Image, { type StaticImageData } from 'next/image'

import { Input } from '@/shared/ui/input'

import type { ChangeEventHandler } from 'react'

const IMAGE_SIZE_CLASS = 'h-[150px] w-[150px]'
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/webp']

type ProfileImageProps = {
  imageSrc: string | StaticImageData
  onChange: ChangeEventHandler<HTMLInputElement>
  inputId?: string
}

export function ProfileImage({ imageSrc, onChange, inputId = 'profileImage' }: ProfileImageProps) {
  return (
    <label
      className={`bg-muted flex items-center justify-center rounded-full ${IMAGE_SIZE_CLASS}`}
      htmlFor={inputId}
    >
      <Image
        src={imageSrc}
        alt="프로필 이미지"
        className={`rounded-full object-cover ${IMAGE_SIZE_CLASS}`}
        width={150}
        height={150}
      />
      <Input
        className="sr-only"
        type="file"
        id={inputId}
        accept={ACCEPTED_TYPES.join(',')}
        onChange={onChange}
      />
    </label>
  )
}
