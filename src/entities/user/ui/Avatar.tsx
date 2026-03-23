'use client'

import { useQueryClient } from '@tanstack/react-query'
import Image, { type StaticImageData } from 'next/image'
import { useEffect, useRef, useState } from 'react'

import DefaultAvatar from '@/shared/assets/images/default-avatar.svg'

import { MY_PROFILE_QUERY_KEY } from '../model/myProfileQueryKey'
import { useProfile, useSetProfile } from '../model/useUserStore'

import type { UserProfile } from '../model/userProfile'

type AvatarImageSource = string | StaticImageData

interface AvatarProps {
  avatar_src: string | StaticImageData
  size: number
  alt?: string
}

const KAKAO_CDN_HTTP_PREFIX = 'http://k.kakaocdn.net'
const KAKAO_CDN_HTTPS_PREFIX = 'https://k.kakaocdn.net'
const S3_HTTP_PREFIX = 'http://imymemine1.s3.ap-northeast-2.amazonaws.com'
const S3_HTTPS_PREFIX = 'https://imymemine1.s3.ap-northeast-2.amazonaws.com'
const PLACEHOLDER_CLASSNAME = 'absolute inset-0 rounded-full bg-secondary/60'
const isS3PresignedUrl = (src: string) => {
  if (!src) return false
  try {
    const url = new URL(src)
    const isS3Host =
      /\.s3[.-][a-z0-9-]+\.amazonaws\.com$/.test(url.hostname) ||
      /\.s3\.amazonaws\.com$/.test(url.hostname)
    const hasPresignedParams =
      url.searchParams.has('X-Amz-Signature') ||
      url.searchParams.has('X-Amz-Algorithm') ||
      url.searchParams.has('X-Amz-Credential') ||
      url.searchParams.has('X-Amz-Date')

    return isS3Host && hasPresignedParams
  } catch {
    return false
  }
}

const normalizeAvatarSrc = (src: AvatarImageSource) => {
  if (typeof src !== 'string') return src

  if (src.startsWith(KAKAO_CDN_HTTP_PREFIX)) {
    return `${KAKAO_CDN_HTTPS_PREFIX}${src.slice(KAKAO_CDN_HTTP_PREFIX.length)}`
  }
  if (src.startsWith(S3_HTTP_PREFIX)) {
    return `${S3_HTTPS_PREFIX}${src.slice(S3_HTTP_PREFIX.length)}`
  }
  return src
}

export function Avatar({ avatar_src, size, alt = 'profile image' }: AvatarProps) {
  const queryClient = useQueryClient()
  const profile = useProfile()
  const setProfile = useSetProfile()
  const isFallback = !avatar_src
  const src = isFallback ? DefaultAvatar : normalizeAvatarSrc(avatar_src)
  const [loadedSrc, setLoadedSrc] = useState<AvatarImageSource | null>(isFallback ? src : null)

  // 현재 avatar URL에 대한 재발급 요청 1회 제한 장치
  const retriedRef = useRef(false)
  const isImageLoaded = isFallback || loadedSrc === src

  // 새 아바타 URL(특히 presigned URL)이 들어오면 재시도 플래그를 다시 열어 재시도 가능
  useEffect(() => {
    retriedRef.current = false
  }, [avatar_src])

  const handleAvatarError = async () => {
    // 기본 이미지/카카오 CDN/일반 URL은 presigned 만료 재발급 대상이 아니므로 무시
    if (typeof avatar_src !== 'string' || !avatar_src || !isS3PresignedUrl(avatar_src)) return
    // 같은 URL에서 에러가 반복될 때 invalidate 무한 반복을 막는다.(중복 재발급 요청 방지)
    if (retriedRef.current) return

    retriedRef.current = true
    await queryClient.invalidateQueries({ queryKey: MY_PROFILE_QUERY_KEY })

    // invalidate 후 active query가 갱신됐다면, 캐시의 최신 프로필을 store에도 반영
    // 이렇게 해야 store 기반으로 이미지를 렌더하는 화면(ProfileImageInput 등)도 재발급된 presigned URL을 바로 사용할 수 있다.
    const nextProfile = queryClient.getQueryData<UserProfile>(MY_PROFILE_QUERY_KEY)
    if (!nextProfile) return
    if (profile.id === nextProfile.id && profile.profileImageUrl === nextProfile.profileImageUrl) {
      return
    }

    setProfile(nextProfile)
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center overflow-hidden rounded-full"
    >
      {isImageLoaded ? null : <div className={PLACEHOLDER_CLASSNAME} />}
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={[
          'h-full w-full object-cover object-center transition-opacity duration-200',
          isImageLoaded ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        onError={() => {
          void handleAvatarError()
        }}
        priority={true}
        fetchPriority="high"
        onLoad={() => {
          setLoadedSrc(src)
        }}
      />
    </div>
  )
}
