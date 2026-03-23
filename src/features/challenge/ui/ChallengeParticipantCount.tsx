'use client'

import { memo } from 'react'

import { useChallengeParticipantsCountStream } from '../model/useChallengeParticipantsCountStream'

type ChallengeParticipantCountProps = {
  challengeId: number | null
  initialParticipantCount: number | null
  shouldConnect: boolean
  shouldStop: boolean
}

const PARTICIPANT_COUNT_BOX_CLASSNAME =
  'border-primary mt-6 flex min-h-12.5 min-w-87.5 items-center justify-center rounded-xl border text-center'

function ChallengeParticipantCountBase({
  challengeId,
  initialParticipantCount,
  shouldConnect,
  shouldStop,
}: ChallengeParticipantCountProps) {
  const participantCount = useChallengeParticipantsCountStream({
    challengeId,
    initialParticipantCount,
    shouldConnect,
    shouldStop,
  })

  return (
    <div className={PARTICIPANT_COUNT_BOX_CLASSNAME}>
      <p>{`현재 챌린지에 ${participantCount ?? ''}명이 도전 중입니다!`}</p>
    </div>
  )
}

export const ChallengeParticipantCount = memo(ChallengeParticipantCountBase)
