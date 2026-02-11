'use client'

import { useQueryClient } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { Avatar, Nickname, StatCards, useProfile } from '@/entities/user'
import { useAccessToken } from '@/features/auth'

const AVATAR_SIZE_PX = 60

const S3_HTTP_PREFIX = 'http://imymemine1.s3.ap-northeast-2.amazonaws.com'
const S3_HTTPS_PREFIX = 'https://imymemine1.s3.ap-northeast-2.amazonaws.com'

// presigned GET URL이면 보통 X-Amz-* 쿼리가 붙음
const isS3PresignedUrl = (src: string) =>
  (src.startsWith(S3_HTTPS_PREFIX) || src.startsWith(S3_HTTP_PREFIX)) && src.includes('X-Amz-')

interface ProfileDashboardProps {
  navigateToMyPage?: boolean
  showBackButton?: boolean
}

export function ProfileDashboard({
  navigateToMyPage = true,
  showBackButton = false,
}: ProfileDashboardProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const accessToken = useAccessToken()

  const profile = useProfile()

  // ✅ 무한 루프 방지: 같은 렌더 사이클에서 계속 에러 나면 invalidate 반복될 수 있음
  const retriedRef = useRef(false)

  useEffect(() => {
    retriedRef.current = false
  }, [profile.profileImageUrl])

  const handleAvatarError = async () => {
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
    if (!navigateToMyPage) return
    router.push('/mypage')
  }

  const handleBackButton = () => {
    if (!showBackButton) return
    router.back()
  }

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
          <Nickname nickname={profile.nickname} />
        </div>

        <StatCards
          cardCount={profile.activeCardCount}
          winCount={profile.winCount}
          levelCount={profile.level}
        />
      </div>
    </div>
  )
}
