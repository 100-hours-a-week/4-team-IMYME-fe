'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { ModeButton } from '@/features/mode'

import { useTodayChallenge } from '../model/useTodayChallenge'

const CHALLENGE_PAGE_PATH = '/challenge'
const CLOSED_CHALLENGE_ERROR_PREFIX = 'challenge_not_open'
const UPLOADED_PARTICIPATION_STATUS = 'UPLOADED'
const PROCESSING_PARTICIPATION_STATUS = 'PROCESSING'
const CHALLENGE_STATUS_CHECK_FAILED_MESSAGE = '챌린지는 매일 22:00에 오픈됩니다!'
const CHALLENGE_NOT_OPEN_FALLBACK_MESSAGE = '챌린지가 열리지 않았습니다.'
const CHALLENGE_ALREADY_SUBMITTED_MESSAGE = '이미 오늘 챌린지에 참여했습니다.'

export function ChallengeModeButton() {
  const router = useRouter()
  const [isCheckingChallengeStatus, setIsCheckingChallengeStatus] = useState(false)
  const todayChallengeQuery = useTodayChallenge({ enabled: false })

  const handleChallengeModeClick = async () => {
    if (isCheckingChallengeStatus) return

    setIsCheckingChallengeStatus(true)
    const todayChallengeResult = await todayChallengeQuery.refetch()
    setIsCheckingChallengeStatus(false)

    if (todayChallengeResult.isError || !todayChallengeResult.data) {
      const isChallengeClosedError = todayChallengeResult.error?.message.startsWith(
        CLOSED_CHALLENGE_ERROR_PREFIX,
      )

      if (isChallengeClosedError) {
        toast.info(CHALLENGE_NOT_OPEN_FALLBACK_MESSAGE)
        return
      }

      toast.error(CHALLENGE_STATUS_CHECK_FAILED_MESSAGE)
      return
    }

    if (
      todayChallengeResult.data.myParticipation?.status === UPLOADED_PARTICIPATION_STATUS ||
      todayChallengeResult.data.myParticipation?.status === PROCESSING_PARTICIPATION_STATUS
    ) {
      toast.info(CHALLENGE_ALREADY_SUBMITTED_MESSAGE)
      return
    }

    router.push(`${CHALLENGE_PAGE_PATH}/${todayChallengeResult.data.id}`)
  }

  return (
    <ModeButton
      variant="challenge"
      disabled={isCheckingChallengeStatus}
      onClick={() => {
        void handleChallengeModeClick()
      }}
    />
  )
}
