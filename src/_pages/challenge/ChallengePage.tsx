'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { useChallengeRecordController } from '@/features/challenge/model/useChallengeRecordController'
import { useTodayChallenge } from '@/features/challenge/model/useTodayChallenge'
import { ChallengeKeywordCard } from '@/features/challenge/ui/ChallengeKeywordCard'
import { ChallengeParticipantCount } from '@/features/challenge/ui/ChallengeParticipantCount'
import { MicrophoneBox } from '@/features/record'
import { Button, ModeHeader, RecordTipBox } from '@/shared'

const MAIN_PAGE_PATH = '/main'

const CHALLENGE_LOAD_ERROR_TOAST_MESSAGE = '챌린지 정보를 불러오지 못했습니다. 메인으로 이동합니다.'
const CHALLENGE_LOADING_MESSAGE = '오늘의 챌린지 정보를 불러오는 중입니다...'
const CHALLENGE_REDIRECTING_MESSAGE = '메인으로 이동합니다...'
const CHALLENGE_READY_MESSAGE = '키워드가 제시되었습니다!'

function ChallengeContentSkeleton() {
  return (
    <>
      <div className="bg-secondary h-22.5 w-80 animate-pulse rounded-xl" />
      <div className="bg-secondary h-58 w-80 animate-pulse rounded-2xl" />
      <div className="bg-secondary h-16 w-80 animate-pulse rounded-xl" />
      <div className="mt-auto flex flex-col items-center">
        <div className="bg-primary/30 h-12.5 w-87.5 animate-pulse rounded-xl" />
        <div className="border-primary bg-secondary mt-6 h-12.5 w-87.5 animate-pulse rounded-xl border" />
      </div>
    </>
  )
}

const getChallengeStatusMessage = (params: {
  isLoading: boolean
  isError: boolean
  shouldRedirectToMain: boolean
}) => {
  if (params.isLoading) return CHALLENGE_LOADING_MESSAGE
  if (params.isError) return CHALLENGE_LOAD_ERROR_TOAST_MESSAGE
  if (params.shouldRedirectToMain) return CHALLENGE_REDIRECTING_MESSAGE
  if (!params.shouldRedirectToMain) return CHALLENGE_READY_MESSAGE
  return CHALLENGE_REDIRECTING_MESSAGE
}

export function ChallengePage() {
  const router = useRouter()
  const hasHandledQueryErrorRef = useRef(false)
  const hasReplacedAfterSubmissionRef = useRef(false)
  const todayChallengeQuery = useTodayChallenge()
  const todayChallenge = todayChallengeQuery.data
  const challengeId = todayChallenge?.id ?? null
  const {
    handleMicClick,
    handleRecordingComplete,
    getElapsedSeconds,
    isRecording,
    isPaused,
    recordedBlob,
    isSubmittingFeedback,
    isSubmissionCompleted,
    canSubmitRecording,
  } = useChallengeRecordController({
    challengeId,
    challengeEndAt: todayChallenge?.endAt ?? null,
  })
  const shouldRedirectToMain =
    todayChallengeQuery.isError || (!todayChallengeQuery.isLoading && !todayChallengeQuery.data)
  const shouldRenderSkeleton = todayChallengeQuery.isLoading || shouldRedirectToMain
  const statusMessage = getChallengeStatusMessage({
    isLoading: todayChallengeQuery.isLoading,
    isError: todayChallengeQuery.isError,
    shouldRedirectToMain,
  })

  useEffect(() => {
    if (!shouldRedirectToMain) return
    if (hasHandledQueryErrorRef.current) return

    hasHandledQueryErrorRef.current = true
    if (todayChallengeQuery.isError) {
      toast.error(CHALLENGE_LOAD_ERROR_TOAST_MESSAGE)
    }
    router.replace(MAIN_PAGE_PATH)
  }, [router, shouldRedirectToMain, todayChallengeQuery.isError])

  useEffect(() => {
    if (!isSubmissionCompleted) return
    if (hasReplacedAfterSubmissionRef.current) return

    hasReplacedAfterSubmissionRef.current = true
    router.replace(MAIN_PAGE_PATH)
  }, [isSubmissionCompleted, router])

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <ModeHeader
        mode="challenge"
        step="waiting"
        onBack={handleBack}
      />
      <div className="flex h-full w-full flex-col items-center gap-4 py-4">
        <p className="text-center">{statusMessage}</p>
        {shouldRenderSkeleton ? (
          <ChallengeContentSkeleton />
        ) : (
          <>
            <ChallengeKeywordCard
              variant="today"
              keyword={todayChallenge?.keyword.name ?? ''}
            />
            <MicrophoneBox
              onMicClick={handleMicClick}
              title="음성으로 말해보세요."
              description={
                '키워드에 대해 생각하신 후, 준비가 되면 시작해주세요! 기회는 한 번입니다.'
              }
              errorMessage={''}
              isMicDisabled={Boolean(recordedBlob)}
              isRecording={isRecording}
              isPaused={isPaused}
              getElapsedSeconds={getElapsedSeconds}
            />
            <RecordTipBox />
            <div className="mt-auto">
              <Button
                variant="record_confirm_btn"
                onClick={() => {
                  void handleRecordingComplete()
                }}
                disabled={!isRecording || !canSubmitRecording || isSubmittingFeedback}
              >
                녹음 완료 및 제출하기
              </Button>
              <ChallengeParticipantCount
                challengeId={challengeId}
                initialParticipantCount={todayChallenge?.participantCount ?? null}
                shouldConnect={!shouldRenderSkeleton}
                shouldStop={isRecording}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
