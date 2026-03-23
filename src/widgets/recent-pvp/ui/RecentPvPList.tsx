'use client'

import { useRouter } from 'next/navigation'

import { PvPCard } from '@/entities/pvp-card'
import { useMyPvPCardList } from '@/features/my-pvp-card/model/useMyPvPCardList'
import { StatusMessage } from '@/shared/ui/StatusMessage'

import type { MyPvPHistoryItem } from '@/features/my-pvp-card/api/getMyPvPCardList'

const LIST_CLASSNAME = 'mt-5 flex flex-col items-center gap-4'
const RECENT_PVP_LIMIT = 3
const EMPTY_MESSAGE = '최근 대결 기록이 없습니다.'
const ERROR_MESSAGE = '최근 대결 기록을 불러오지 못했습니다.'
const LOADING_MESSAGE = '최근 대결 기록을 불러오는 중입니다...'

const getRecentHistoryItems = (histories: MyPvPHistoryItem[]) => histories

export function RecentPvPList() {
  const router = useRouter()
  const myPvPCardListQuery = useMyPvPCardList({ size: RECENT_PVP_LIMIT })

  if (myPvPCardListQuery.isLoading) {
    return <StatusMessage message={LOADING_MESSAGE} />
  }

  if (myPvPCardListQuery.isError || myPvPCardListQuery.data?.ok === false) {
    return <StatusMessage message={ERROR_MESSAGE} />
  }

  const recentHistories = myPvPCardListQuery.data?.ok
    ? getRecentHistoryItems(myPvPCardListQuery.data.data.histories)
    : []

  if (recentHistories.length === 0) {
    return <StatusMessage message={EMPTY_MESSAGE} />
  }

  return (
    <div className={LIST_CLASSNAME}>
      {recentHistories.map((history) => (
        <PvPCard
          key={history.historyId}
          historyId={history.historyId}
          title={history.room.name}
          resultVariant={history.myResult.isWinner ? 'win' : 'lose'}
          opponentName={history.opponent.nickname}
          categoryName={history.category.name}
          keywordName={history.keyword.name}
          onClick={() => router.push(`/mypage`)}
          onDelete={async () => {
            await myPvPCardListQuery.refetch()
          }}
        />
      ))}
    </div>
  )
}
