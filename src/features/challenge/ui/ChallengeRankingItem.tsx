import Image from 'next/image'

type ChallengeRankingVariant = '1st' | '2nd' | '3rd'

type ChallengeRankingItemProps = {
  variant: ChallengeRankingVariant
  nickname: string
  profileImageUrl?: string | null
}

const ITEM_WRAPPER_CLASSNAME =
  'border-secondary flex h-12.5 w-80 items-center justify-center self-center rounded-xl border shadow-[0_-2px_1px_rgba(255,255,255,1),0_2px_1px_rgba(0,0,0,0.1)]'
const RANK_LABEL_CLASSNAME = 'text-primary ml-3 w-10 shrink-0 text-right font-semibold'
const PROFILE_SECTION_CLASSNAME = 'ml-4 flex flex-1 items-center gap-2'
const PROFILE_IMAGE_CLASSNAME = 'h-8 w-8 rounded-full object-cover bg-gray-200'
const PROFILE_PLACEHOLDER_CLASSNAME = 'h-8 w-8 rounded-full bg-gray-200'
const NICKNAME_CLASSNAME = 'text-sm font-semibold'

export function ChallengeRankingItem({
  variant,
  nickname,
  profileImageUrl,
}: ChallengeRankingItemProps) {
  return (
    <div className={ITEM_WRAPPER_CLASSNAME}>
      <p className={RANK_LABEL_CLASSNAME}>{variant}</p>
      <div className={PROFILE_SECTION_CLASSNAME}>
        {profileImageUrl ? (
          <Image
            src={profileImageUrl}
            alt={`${nickname} profile`}
            width={32}
            height={32}
            className={PROFILE_IMAGE_CLASSNAME}
          />
        ) : (
          <div className={PROFILE_PLACEHOLDER_CLASSNAME} />
        )}
        <p className={NICKNAME_CLASSNAME}>{nickname}</p>
      </div>
    </div>
  )
}
