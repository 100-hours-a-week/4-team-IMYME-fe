import { ChallengeRankingItem } from '@/features/challenge/ui/ChallengeRankingItem'

import type { LatestChallengeRankingItem } from '@/features/challenge/api/getLatestChallengeRanking'

const TOP_RANKING_LIMIT = 3
const CHALLENGE_TOP_RANK_VARIANTS = ['1st', '2nd', '3rd'] as const
const SKELETON_ROW_CLASSNAME =
  'border-secondary h-12.5 w-80 animate-pulse self-center rounded-xl border bg-gray-100'

type ChallengeTopRankingsProps = {
  rankings?: LatestChallengeRankingItem[]
  isLoading?: boolean
}

const getTopRankingItems = (rankings: LatestChallengeRankingItem[] | undefined) =>
  (rankings ?? []).slice(0, TOP_RANKING_LIMIT).map((ranking, index) => ({
    variant: CHALLENGE_TOP_RANK_VARIANTS[index],
    nickname: ranking.nickname,
    profileImageUrl: ranking.profileImageUrl,
  }))

export function ChallengeTopRankings({ rankings, isLoading = false }: ChallengeTopRankingsProps) {
  const topRankingItems = getTopRankingItems(rankings)

  return Array.from({ length: TOP_RANKING_LIMIT }, (_, index) => {
    const rankingItem = topRankingItems[index]

    if (isLoading || !rankingItem) {
      return (
        <div
          key={`ranking-skeleton-${index}`}
          className={SKELETON_ROW_CLASSNAME}
        />
      )
    }

    return (
      <ChallengeRankingItem
        key={rankingItem.variant}
        variant={rankingItem.variant}
        nickname={rankingItem.nickname}
        profileImageUrl={rankingItem.profileImageUrl}
      />
    )
  })
}
