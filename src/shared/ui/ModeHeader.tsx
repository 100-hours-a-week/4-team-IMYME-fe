'use client'

import { BackButton, ProgressField } from '@/shared'

type LevelUpStep = 'category' | 'keyword' | 'recording' | 'feedback'
type PvPStep = 'matching_list' | 'matching_enter' | 'matching_create' | 'battle'

type ModeHeaderProps =
  | {
      mode: 'levelup'
      step: LevelUpStep
      onBack: () => void
      title?: string
      progressValue?: number
      stepLabel?: string
    }
  | {
      mode: 'pvp'
      step: PvPStep
      onBack: () => void
      title?: string
      progressValue?: number
      stepLabel?: string
    }

const LEVELUP_TITLE_TEXT = '레벨업 모드'
const PVP_TITLE_TEXT = 'PvP 모드'

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
}

export function ModeHeader({
  mode,
  step,
  title,
  onBack,
  progressValue,
  stepLabel,
}: ModeHeaderProps) {
  const titleText = title ?? (mode === 'levelup' ? LEVELUP_TITLE_TEXT : PVP_TITLE_TEXT)
  const subtitleText =
    mode === 'levelup'
      ? LEVELUP_SUBTITLE_BY_STEP[step as LevelUpStep]
      : PVP_SUBTITLE_BY_STEP[step as PvPStep]
  const shouldShowProgress = typeof progressValue === 'number' && Boolean(stepLabel)

  return (
    <>
      <div className="flex w-full gap-3">
        <BackButton onClick={onBack} />
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
