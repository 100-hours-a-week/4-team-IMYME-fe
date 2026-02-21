'use client'

import { useQueryClient } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { Avatar, Nickname, StatCards, useProfile, type UserProfile } from '@/entities/user'
import { useAccessToken } from '@/features/auth'

const AVATAR_SIZE_PX = 60
const FALLBACK_NICKNAME = '로딩중...'
const FALLBACK_STAT_VALUE = 0

// presigned GET URL이면 보통 X-Amz-* 쿼리가 붙음
const isS3PresignedUrl = (src: string) => {
  if (!src) return false
  try {
    const u = new URL(src)
    const host = u.hostname // dev-imymemine.s3.ap-northeast-2.amazonaws.com

    // ✅ S3 host 패턴(virtual-hosted-style) + presigned 파라미터 존재 여부
    const isS3Host =
      /\.s3[.-][a-z0-9-]+\.amazonaws\.com$/.test(host) || /\.s3\.amazonaws\.com$/.test(host)
    const hasAmz =
      u.searchParams.has('X-Amz-Signature') ||
      u.searchParams.has('X-Amz-Algorithm') ||
      u.searchParams.has('X-Amz-Credential') ||
      u.searchParams.has('X-Amz-Date')

    return isS3Host && hasAmz
  } catch {
    return false
  }
}

interface ProfileDashboardProps {
  profile?: UserProfile
  navigateToMyPage?: boolean
  showBackButton?: boolean
}

export function ProfileDashboard({
  profile: profileProp,
  navigateToMyPage = true,
  showBackButton = false,
}: ProfileDashboardProps) {
  // 라우팅/캐시/토큰
  const router = useRouter()
  const queryClient = useQueryClient()
  const accessToken = useAccessToken()

  // props가 없으면 store 프로필을 fallback으로 사용
  const storeProfile = useProfile()
  const profile = profileProp ?? storeProfile

  // ✅ 무한 루프 방지: 같은 렌더 사이클에서 계속 에러 나면 invalidate 반복될 수 있음
  const retriedRef = useRef(false)

  useEffect(() => {
    retriedRef.current = false
  }, [profile.profileImageUrl])

  const handleAvatarError = async () => {
    // presigned URL 만료 시 재발급 유도
    const url = profile.profileImageUrl

    // ✅ 카카오 CDN/기본 이미지면 만료 이슈가 아니라서 재발급 시도 X
    if (!url || !isS3PresignedUrl(url)) return

    if (!accessToken) return
    if (retriedRef.current) return
    retriedRef.current = true

    // ✅ 캐시 무효화 → /users/me 재호출 → profileImageUrl 새로 받기
    await queryClient.invalidateQueries({ queryKey: ['myProfile'] })

    // ✅ 새 URL을 받으면 다시 재시도 가능하게 풀어주고 싶으면,
    // profile.profileImageUrl이 바뀌는 시점(useEffect)에서 retriedRef를 false로 리셋하면 됨
  }

  const handleNavigateToMyPage = () => {
    // 내 페이지 이동
    if (!navigateToMyPage) return
    router.push('/mypage')
  }

  const handleBackButton = () => {
    // 뒤로가기
    if (!showBackButton) return
    router.back()
  }

  const isProfileReady = Boolean(profile.nickname || profile.profileImageUrl)

  return (
    <div className="relative w-full">
      <div
        className={['absolute rounded-md p-1', showBackButton ? '' : 'invisible'].join(' ')}
        onClick={handleBackButton}
      >
        <ChevronLeft />
      </div>

      <div
        className="w-full cursor-pointer"
        onClick={handleNavigateToMyPage}
      >
        {/* 프로필 요약 */}
        <div className="grid w-full auto-cols-max grid-flow-col items-start gap-4">
          <div
            className="ml-10 overflow-hidden rounded-full"
            style={{ width: AVATAR_SIZE_PX, height: AVATAR_SIZE_PX }}
          >
            <Avatar
              avatar_src={profile.profileImageUrl}
              size={AVATAR_SIZE_PX}
              onError={handleAvatarError} // ✅ 상위에서 처리
            />
          </div>
          <Nickname nickname={isProfileReady ? profile.nickname : FALLBACK_NICKNAME} />
        </div>

        <StatCards
          cardCount={isProfileReady ? profile.activeCardCount : FALLBACK_STAT_VALUE}
          winCount={isProfileReady ? profile.winCount : FALLBACK_STAT_VALUE}
          levelCount={isProfileReady ? profile.level : FALLBACK_STAT_VALUE}
        />
      </div>
    </div>
  )
}
