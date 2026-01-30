'use client'

import { useProfileImage } from '@/entities/user/model/useUserStore'
import {
  ProfileImageInput,
  NicknameInput,
  useNicknameForm,
  useProfileImageForm,
  ProfileEditTryButton,
} from '@/features/profile-edit'
import defaultAvatar from '@/shared/assets/images/default-avatar.svg'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/dialog'

const MODAL_CONTENT_CLASS = 'flex flex-col sm:min-h-[450px] sm:max-w-[350px] items-center'
const LABEL_CLASS = 'self-start font-semibold'

type ProfileEditModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileEditModal({ open, onOpenChange }: ProfileEditModalProps) {
  const {
    imagePreview,
    handleFileChange,
    acceptTypes,
    error: profileImageError,
    errorMessage: profileImageErrorMessage,
  } = useProfileImageForm()
  const {
    nickname,
    storeNickname,
    handleNicknameChange,
    handleNicknameBlur,
    error: nicknameError,
    errorMessage: nicknameErrorMessage,
  } = useNicknameForm()

  const handleProfileEdit = () => {}

  const storeProfileImageUrl = useProfileImage()

  // ✅ 우선순위: (미리보기 props) > (store) > (기본)

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className={MODAL_CONTENT_CLASS}>
        <DialogHeader className="items-center">
          <DialogTitle>프로필 수정하기</DialogTitle>
        </DialogHeader>
        <DialogDescription className={LABEL_CLASS}>프로필 이미지</DialogDescription>
        <ProfileImageInput
          imageSrc={
            imagePreview
              ? imagePreview
              : storeProfileImageUrl
                ? storeProfileImageUrl
                : defaultAvatar
          }
          onChange={handleFileChange}
          acceptTypes={acceptTypes}
          errorMessage={profileImageError ? profileImageErrorMessage : null}
        />
        <DialogDescription className={LABEL_CLASS}>닉네임</DialogDescription>
        <NicknameInput
          value={nickname}
          placeholder={storeNickname}
          onChange={handleNicknameChange}
          onBlur={handleNicknameBlur}
          helperMessage={nicknameError ? nicknameErrorMessage : null}
          helperVariant={nicknameError ? 'error' : 'default'}
        />
        <DialogFooter>
          <ProfileEditTryButton
            onClick={handleProfileEdit}
            disabled={nicknameError || profileImageError}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
