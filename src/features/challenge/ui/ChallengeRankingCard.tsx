'use client'

import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useLatestChallengeRanking } from '../model/useLatestChallengeRanking'

const CARD_CLASSNAME =
  'text-md flex min-h-30 min-w-87.5 flex-col items-center justify-center gap-2 self-center rounded-xl border border-[rgb(var(--color-primary))] bg-white font-semibold shadow-[0_-2px_1px_rgba(255,255,255,1),0_2px_1px_rgba(0,0,0,0.1)]'
const RANKING_NAME_BOX_CLASSNAME =
  'bg-secondary flex h-10 w-50 items-center justify-center rounded-xl text-center font-medium'
const ACTION_ROW_CLASSNAME = 'flex items-center justify-center gap-2 cursor-pointer'
const ARROW_ICON_SIZE = 16
const TOP_RANK_NUMBER = 1
const TOP_RANKING_EMPTY_TEXT = '👑 -'

export function ChallengeRankingCard() {
  const router = useRouter()
  const latestChallengeRankingQuery = useLatestChallengeRanking()
  const topRankingUser = latestChallengeRankingQuery.data?.rankings.find(
    (ranking) => ranking.rank === TOP_RANK_NUMBER,
  )
  const topRankingNickname = latestChallengeRankingQuery.isLoading
    ? TOP_RANKING_EMPTY_TEXT
    : topRankingUser
      ? `👑 ${topRankingUser.nickname}`
      : TOP_RANKING_EMPTY_TEXT

  const handleClickRankingSeeMore = () => {
    router.push('/challenge/ranking')
  }

  return (
    <div className={CARD_CLASSNAME}>
      <p className="text-primary text-sm">어제의 랭킹</p>
      <div className={RANKING_NAME_BOX_CLASSNAME}>
        <p className="font-semibold">{topRankingNickname}</p>
      </div>
      <div
        className={ACTION_ROW_CLASSNAME}
        onClick={handleClickRankingSeeMore}
      >
        <p className="text-primary text-sm font-medium">어제의 랭킹 보기</p>
        <ArrowRight
          size={ARROW_ICON_SIZE}
          color="#408DFE"
        />
      </div>
    </div>
  )
}
