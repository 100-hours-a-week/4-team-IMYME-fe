'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { ChallengeFeedbackPanel } from '@/features/challenge/ui/ChallengeFeedbackPanel'
import { ChallengeKeywordCard } from '@/features/challenge/ui/ChallengeKeywordCard'
import { Button, ModeHeader } from '@/shared'
import { ChallengeTopRankings } from '@/widgets/challenge-ranking'

import type { MyChallengeResultData } from '@/features/challenge/api/getMyChallengeResult'

import { useLatestChallengeRanking, useMyChallengeResult } from '@/features/challenge'

type ChallengeFeedback = {
  summary?: string
  keywords?: string[]
  facts?: string
  understanding?: string
  personalized_feedback?: string
}

const MOSAIC_BACKGROUND_STYLE = {
  backgroundImage:
    'linear-gradient(45deg, rgba(255,255,255,0.35) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.35) 75%, transparent 75%, transparent)',
  backgroundSize: '20px 20px',
} as const

const EMPTY_KEYWORD = '-'
const EMPTY_RANK_TEXT = '-'
const RANKING_LOADING_MESSAGE = '랭킹 정보를 불러오는 중입니다.'
const FEEDBACK_LOADING_MESSAGE = '피드백을 불러오는 중입니다.'
const FEEDBACK_WAITING_RESULT_MESSAGE = 'AI 분석 중입니다. 잠시만 기다려주세요.'
const FEEDBACK_NO_RESULT_MESSAGE = '아직 결과 데이터가 준비되지 않았습니다.'
const CHALLENGE_COMPLETED_STATUS = 'COMPLETED'
const FEEDBACK_PENDING_MESSAGE = '챌린지 결과 집계 중입니다. 잠시 후 다시 확인해주세요.'

const getChallengeFeedbackFromResult = (
  challengeResult: MyChallengeResultData | undefined,
): ChallengeFeedback | undefined => {
  if (!challengeResult) return undefined

  const feedback = challengeResult.myResult?.feedback

  if (!feedback) {
    return {
      summary: FEEDBACK_WAITING_RESULT_MESSAGE,
      keywords: [challengeResult.keywordName],
      facts: FEEDBACK_NO_RESULT_MESSAGE,
      understanding: challengeResult.status,
      personalized_feedback: FEEDBACK_NO_RESULT_MESSAGE,
    }
  }

  return {
    summary: feedback.summary,
    keywords: feedback.keywords ?? [challengeResult.keywordName],
    facts: feedback.facts,
    understanding: feedback.understanding,
    personalized_feedback: feedback.personalized_feedback,
  }
}

export function ChallengeRankingPage() {
  const [showFeedback, setShowFeedback] = useState(false)
  const latestChallengeRankingQuery = useLatestChallengeRanking()
  const rankingData = latestChallengeRankingQuery.data
  const isRankingLoading = latestChallengeRankingQuery.isLoading
  const challengeId = rankingData?.challenge.id
  const challengeStatus = rankingData?.challenge.status
  const isChallengeCompleted = challengeStatus === CHALLENGE_COMPLETED_STATUS
  const myChallengeResultQuery = useMyChallengeResult(challengeId ?? 0, {
    enabled: false,
  })
  const challengeFeedback = getChallengeFeedbackFromResult(myChallengeResultQuery.data)
  const hasRankingData = Boolean(rankingData)
  const hasParticipatedInChallenge = rankingData?.myRank != null
  const myRankValue = rankingData?.myRank?.rank
  const hasMyRank = typeof myRankValue === 'number'
  const myRankText = hasMyRank ? `${myRankValue}위` : EMPTY_RANK_TEXT
  const keywordName = rankingData?.challenge.keywordName ?? EMPTY_KEYWORD
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  const handleClickShowFeedback = () => {
    if (!isChallengeCompleted) {
      return
    }

    setShowFeedback(true)

    if (!challengeId) {
      return
    }

    void myChallengeResultQuery.refetch()
  }

  const renderFeedbackSection = () => {
    if (!hasRankingData) {
      return (
        <div
          className="bg-secondary flex h-90 w-90 items-center justify-center rounded-xl"
          style={MOSAIC_BACKGROUND_STYLE}
        >
          <p className="text-sm font-semibold">{RANKING_LOADING_MESSAGE}</p>
        </div>
      )
    }

    if (showFeedback && hasParticipatedInChallenge) {
      if (!isChallengeCompleted) {
        return (
          <div
            className="bg-secondary flex h-90 w-90 items-center justify-center rounded-xl"
            style={MOSAIC_BACKGROUND_STYLE}
          >
            <p className="text-sm font-semibold">{FEEDBACK_PENDING_MESSAGE}</p>
          </div>
        )
      }

      if (myChallengeResultQuery.isFetching) {
        return (
          <div
            className="bg-secondary flex h-90 w-90 items-center justify-center rounded-xl"
            style={MOSAIC_BACKGROUND_STYLE}
          >
            <p className="text-sm font-semibold">{FEEDBACK_LOADING_MESSAGE}</p>
          </div>
        )
      }

      return <ChallengeFeedbackPanel feedback={challengeFeedback} />
    }

    if (hasParticipatedInChallenge) {
      return (
        <div
          className="bg-secondary flex h-90 w-90 flex-col items-center justify-center rounded-xl"
          style={MOSAIC_BACKGROUND_STYLE}
        >
          <Button
            variant="ranking_show_feedback_btn"
            onClick={handleClickShowFeedback}
            disabled={!isChallengeCompleted}
          >
            피드백 보기
          </Button>
          {!isChallengeCompleted ? (
            <p className="mt-3 text-center text-sm font-semibold">{FEEDBACK_PENDING_MESSAGE}</p>
          ) : null}
        </div>
      )
    }

    return (
      <div
        className="bg-secondary flex h-90 w-90 items-center justify-center rounded-xl"
        style={MOSAIC_BACKGROUND_STYLE}
      >
        <p className="text-sm font-semibold">챌린지 미참여자에게는 피드백이 제공되지 않습니다.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <ModeHeader
        mode="challenge"
        step="ranking"
        onBack={handleBack}
      />
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="border-primary flex h-22.5 w-80 flex-col items-center justify-center gap-4 rounded-xl border shadow-[0_-2px_1px_rgba(255,255,255,1),0_2px_1px_rgba(0,0,0,0.1)]">
          <p className="text-sm">나의 랭킹</p>
          <p className="text-lg font-semibold">{myRankText}</p>
        </div>
        <ChallengeKeywordCard
          variant="yesterday"
          keyword={keywordName}
        />
        <ChallengeTopRankings
          rankings={rankingData?.rankings}
          isLoading={isRankingLoading}
        />
        {renderFeedbackSection()}
      </div>
    </div>
  )
}
