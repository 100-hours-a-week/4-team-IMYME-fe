'use client'

import { useProfile, useProfileImage, useSetProfile, getMyProfile } from '@/entities/user'
import { useAccessToken } from '@/features/auth'
import {
  ProfileImageInput,
  NicknameInput,
  useNicknameForm,
  useProfileImageForm,
  ProfileEditTryButton,
  getProfileImageUrl,
  uploadProfileImage,
  updateProfile,
} from '@/features/profile-edit'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  defaultAvatar,
} from '@/shared'

const MODAL_CONTENT_CLASS = 'flex flex-col sm:min-h-[450px] sm:max-w-[350px] items-center'
const LABEL_CLASS = 'self-start font-semibold'

type ProfileEditModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileEditModal({ open, onOpenChange }: ProfileEditModalProps) {
  const {
    imagePreview,
    file,
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

  const accessToken = useAccessToken()
  const profile = useProfile()
  const setProfile = useSetProfile()

  const handleProfileEdit = async () => {
    if (!accessToken) return

    const trimmedNickname = nickname.trim()
    const nextNickname = trimmedNickname.length > 0 ? trimmedNickname : null
    // let profileImageUrl: string | null = null
    let profileImageKey: string | null = null

    if (file) {
      const presigned = await getProfileImageUrl(accessToken, file.type)
      if (!presigned.ok) return

      const uploadResult = await uploadProfileImage(presigned.uploadUrl, file)
      if (!uploadResult.ok) return

      // profileImageUrl = presigned.profileImageUrl
      profileImageKey = presigned.profileImageKey
    }

    if (!nextNickname && !profileImageKey) return

    const result = await updateProfile(accessToken, {
      nickname: nextNickname,
      profileImageKey,
    })

    if (!result.ok || !result.data) return

    const myProfileResult = await getMyProfile(accessToken)
    if (!myProfileResult.ok) {
      setProfile({
        id: result.data.id ?? profile.id,
        nickname: result.data.nickname ?? profile.nickname,
        profileImageUrl: result.data.profileImageUrl ?? profile.profileImageUrl,
        level: result.data.level ?? profile.level,
        activeCardCount: result.data.activeCardCount ?? profile.activeCardCount,
        consecutiveDays: result.data.consecutiveDays ?? profile.consecutiveDays,
        winCount: result.data.winCount ?? profile.winCount,
      })
      onOpenChange(false)
      return
    }

    setProfile(myProfileResult.data)
    onOpenChange(false)
  }

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
