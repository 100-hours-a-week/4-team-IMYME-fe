import Image, { type StaticImageData } from 'next/image'
import { type ChangeEventHandler } from 'react'

import { HelperText } from '@/shared'
import { Input } from '@/shared/ui/input'

const IMAGE_SIZE_CLASS = 'h-[150px] w-[150px]'

type ProfileImageInputProps = {
  imageSrc: string | StaticImageData
  onChange: ChangeEventHandler<HTMLInputElement>
  acceptTypes: string
  errorMessage?: string | null
  inputId?: string
}

export function ProfileImageInput({
  imageSrc,
  onChange,
  acceptTypes,
  errorMessage = null,
  inputId = 'profileImage',
}: ProfileImageInputProps) {
  return (
    <div className="flex w-full flex-col items-center">
      <label
        className={`bg-muted flex items-center justify-center rounded-full ${IMAGE_SIZE_CLASS}`}
        htmlFor={inputId}
      >
        <Image
          unoptimized
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
          accept={acceptTypes}
          onChange={onChange}
        />
      </label>
      <div className="mt-2 flex min-h-4 w-full">
        {errorMessage ? (
          <HelperText
            message={errorMessage}
            variant="error"
          />
        ) : null}
      </div>
    </div>
  )
}
