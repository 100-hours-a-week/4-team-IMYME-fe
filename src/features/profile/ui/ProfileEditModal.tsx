import { type ChangeEvent, type ReactNode, useEffect, useState } from 'react'

import { ProfileImage, NicknameInput, ProfileEditButton } from '@/features/profile'
import defaultAvatar from '@/shared/assets/images/default-avatar.svg'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/dialog'

const MODAL_CONTENT_CLASS = 'flex flex-col sm:min-h-[450px] sm:max-w-[350px] items-center'
const LABEL_CLASS = 'self-start font-semibold'
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/webp']
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

type ProfileEditModalProps = {
  trigger: ReactNode
  onClose?: () => void
}

export function ProfileEditModal({ trigger, onClose }: ProfileEditModalProps) {
  const [nickname, setNickname] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setImagePreview(null)
      return
    }

    if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE_BYTES) {
      setImagePreview(null)
      return
    }

    const nextPreview = URL.createObjectURL(file)
    setImagePreview(nextPreview)
  }

  const handleNicknameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNickname(event.target.value)
  }

  const handleProfileEdit = () => {}

  const handleProfileOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose?.()
    }
  }

  return (
    <Dialog onOpenChange={handleProfileOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={MODAL_CONTENT_CLASS}>
        <DialogHeader className="items-center">
          <DialogTitle>프로필 수정하기</DialogTitle>
        </DialogHeader>
        <DialogDescription className={LABEL_CLASS}>프로필 이미지</DialogDescription>
        <ProfileImage
          imageSrc={imagePreview ?? defaultAvatar}
          onChange={handleProfileImageChange}
        />
        <DialogDescription className={LABEL_CLASS}>닉네임</DialogDescription>
        <NicknameInput
          value={nickname}
          onChange={handleNicknameChange}
        />
        <DialogFooter>
          <ProfileEditButton onClick={handleProfileEdit} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
