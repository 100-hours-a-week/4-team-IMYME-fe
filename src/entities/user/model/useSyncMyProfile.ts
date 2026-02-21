'use client'

import { useEffect } from 'react'

import { useProfile, useSetProfile } from './useUserStore'

import type { UserProfile } from './userProfile'

type UseSyncMyProfileParams = {
  accessToken: string | null
  myProfile?: UserProfile
}

export function useSyncMyProfile({ accessToken, myProfile }: UseSyncMyProfileParams) {
  const profile = useProfile()
  const setProfile = useSetProfile()

  const stripQuery = (url: string) => {
    if (!url) return ''
    try {
      const normalizedUrl = new URL(url)
      return `${normalizedUrl.origin}${normalizedUrl.pathname}`
    } catch {
      return url.split('?')[0]
    }
  }

  // store 동기화는 "필요할 때만" (그리고 같은 값이면 안 넣기)
  useEffect(() => {
    // 토큰/데이터 없으면 동기화하지 않음
    if (!accessToken || !myProfile) return
    // 이미 같은 프로필이면 불필요한 상태 업데이트 방지
    const curBase = stripQuery(profile.profileImageUrl)
    const nextBase = stripQuery(myProfile.profileImageUrl)

    // ✅ 같은 유저 + 같은 파일이면(쿼리만 다른 presigned) store 업데이트 금지
    if (profile.id === myProfile.id && curBase && curBase === nextBase) {
      return
    }

    // ✅ 업데이트는 하되, 같은 파일이면 기존 URL을 유지(= src swap 방지)
    setProfile({
      ...myProfile,
      profileImageUrl:
        curBase && curBase === nextBase ? profile.profileImageUrl : myProfile.profileImageUrl,
    })
  }, [accessToken, myProfile, profile.id, profile.profileImageUrl, setProfile])
}
