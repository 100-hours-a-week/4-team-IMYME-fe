'use client'

import { BackButton } from '@/shared/ui/BackButton'
import { ProgressField } from '@/shared/ui/ProgressField'

type LevelUpStep = 'category' | 'keyword' | 'recording' | 'feedback'
type PvPStep =
  | 'matching_list'
  | 'matching_enter'
  | 'matching_create'
  | 'battle'
  | 'recording'
  | 'feedback'
type ChallengeStep = 'waiting' | 'recording' | 'submitted' | 'ranking'

type ModeHeaderProps =
  | {
      mode: 'levelup'
      step: LevelUpStep
      onBack: () => void
      backDisabled?: boolean
      title?: string
      progressValue?: number
      stepLabel?: string
    }
  | {
      mode: 'pvp'
      step: PvPStep
      onBack: () => void
      backDisabled?: boolean
      title?: string
      progressValue?: number
      stepLabel?: string
    }
  | {
      mode: 'challenge'
      step: ChallengeStep
      onBack: () => void
      backDisabled?: boolean
      title?: string
      progressValue?: number
      stepLabel?: string
    }

const LEVELUP_TITLE_TEXT = '레벨업 모드'
const PVP_TITLE_TEXT = 'PvP 모드'
const CHALLENGE_TITLE_TEXT = '챌린지 모드'

const LEVELUP_SUBTITLE_BY_STEP: Record<LevelUpStep, string> = {
  category: '카테고리 선택',
  keyword: '키워드 선택',
  recording: '음성 녹음',
  feedback: 'AI 피드백',
}

const PVP_SUBTITLE_BY_STEP: Record<PvPStep, string> = {
  matching_list: '매칭 목록',
  matching_enter: '매칭 입장하기',
  matching_create: '매칭 만들기',
  battle: '대결 중',
  recording: '음성 녹음',
  feedback: '대결 피드백',
}

const CHALLENGE_SUBTITLE_BY_STEP: Record<ChallengeStep, string> = {
  waiting: '도전 대기',
  ranking: '어제의 랭킹',
  recording: '',
  submitted: '',
}

export function ModeHeader({
  mode,
  step,
  title,
  onBack,
  backDisabled = false,
  progressValue,
  stepLabel,
}: ModeHeaderProps) {
  const titleText =
    title ??
    (mode === 'levelup'
      ? LEVELUP_TITLE_TEXT
      : mode === 'pvp'
        ? PVP_TITLE_TEXT
        : CHALLENGE_TITLE_TEXT)
  const subtitleText =
    mode === 'levelup'
      ? LEVELUP_SUBTITLE_BY_STEP[step as LevelUpStep]
      : mode === 'pvp'
        ? PVP_SUBTITLE_BY_STEP[step as PvPStep]
        : CHALLENGE_SUBTITLE_BY_STEP[step as ChallengeStep]
  const shouldShowProgress = typeof progressValue === 'number' && Boolean(stepLabel)

  return (
    <>
      <div className="flex w-full gap-3">
        <BackButton
          onClick={onBack}
          disabled={backDisabled}
        />
        <div className="flex flex-col items-start">
          <p className="font-semibold">{titleText}</p>
          <p className="text-sm">{subtitleText}</p>
        </div>
      </div>
      {shouldShowProgress ? (
        <div className="flex w-full justify-center px-6">
          <ProgressField
            value={progressValue as number}
            stepLabel={stepLabel as string}
          />
        </div>
      ) : null}
    </>
  )
}
