import { type ReactNode } from 'react'

import {
  ProfileImage,
  NicknameInput,
  ProfileEditButton,
  useNicknameForm,
  useProfileImageForm,
} from '@/features/profile-edit'
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

const NICKNAME_TOO_SHORT_HELPER = '닉네임은 2자 이상 입력해주세요.'
const NICKNAME_TOO_LONG_HELPER = '닉네임은 10자 이하로 입력해주세요.'
// const NICKNAME_DUPLICATE_HELPER = '이미 사용 중인 닉네임입니다.'

type ProfileEditModalProps = {
  trigger: ReactNode
  onClose?: () => void
}

export function ProfileEditModal({ trigger, onClose }: ProfileEditModalProps) {
  const {
    imagePreview,
    handleFileChange,
    acceptTypes,
    errorMessage: profileImageErrorMessage,
  } = useProfileImageForm()
  const {
    nickname,
    handleNicknameChange,
    handleNicknameBlur,
    hasNicknameError,
    errorMessage: nicknameErrorMessage,
  } = useNicknameForm()

  const handleProfileEdit = () => {}

  const handleProfileModalOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose?.()
    }
  }

  return (
    <Dialog onOpenChange={handleProfileModalOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={MODAL_CONTENT_CLASS}>
        <DialogHeader className="items-center">
          <DialogTitle>프로필 수정하기</DialogTitle>
        </DialogHeader>
        <DialogDescription className={LABEL_CLASS}>프로필 이미지</DialogDescription>
        <ProfileImage
          imageSrc={imagePreview ?? defaultAvatar}
          onChange={handleFileChange}
          acceptTypes={acceptTypes}
          errorMessage={profileImageErrorMessage}
        />
        <DialogDescription className={LABEL_CLASS}>닉네임</DialogDescription>
        <NicknameInput
          value={nickname}
          onChange={handleNicknameChange}
          onBlur={handleNicknameBlur}
          helperMessage={hasNicknameError ? nicknameErrorMessage : null}
          helperVariant={hasNicknameError ? 'error' : 'default'}
        />
        <DialogFooter>
          <ProfileEditButton onClick={handleProfileEdit} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
