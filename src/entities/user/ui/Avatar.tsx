import Image from 'next/image'

import { DefaultAvatar } from '@/shared'

interface AvatarProps {
  avatar_src: string
  size: number
}

const KAKAO_CDN_HTTP_PREFIX = 'http://k.kakaocdn.net'
const KAKAO_CDN_HTTPS_PREFIX = 'https://k.kakaocdn.net'
const S3_HTTP_PREFIX = 'http://imymemine1.s3.ap-northeast-2.amazonaws.com'
const S3_HTTPS_PREFIX = 'https://imymemine1.s3.ap-northeast-2.amazonaws.com'

const normalizeAvatarSrc = (src: string) => {
  if (src.startsWith(KAKAO_CDN_HTTP_PREFIX)) {
    return `${KAKAO_CDN_HTTPS_PREFIX}${src.slice(KAKAO_CDN_HTTP_PREFIX.length)}`
  }
  if (src.startsWith(S3_HTTP_PREFIX)) {
    return `${S3_HTTPS_PREFIX}${src.slice(S3_HTTP_PREFIX.length)}`
  }
  return src
}

export function Avatar({ avatar_src, size }: AvatarProps) {
  const resolvedSrc = avatar_src ? normalizeAvatarSrc(avatar_src) : DefaultAvatar

  return (
    <div
      style={{ width: size, height: size }}
      className="relative overflow-hidden rounded-full"
    >
      <Image
        src={resolvedSrc}
        alt="profile image"
        fill
        sizes={`${size}px`}
        className="object-cover"
        loading="eager"
      />
    </div>
  )
}
