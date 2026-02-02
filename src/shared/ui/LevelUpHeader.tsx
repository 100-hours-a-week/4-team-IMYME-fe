'use client'

import { BackButton, ProgressField } from '@/shared'

type HeaderVariant = 'category' | 'keyword' | 'recording' | 'feedback'

type LevelUpHeaderProps = {
  variant: HeaderVariant
  onBack: () => void
  title?: string
  progressValue?: number
  stepLabel: string
}

const TITLE_TEXT = '레벨업 모드'
const SUBTITLE_TEXT_BY_VARIANT: Record<HeaderVariant, string> = {
  category: '카테고리 선택',
  keyword: '키워드 선택',
  recording: '음성 녹음',
  feedback: 'AI 피드백',
}

export function LevelUpHeader({
  variant,
  title,
  onBack,
  progressValue,
  stepLabel,
}: LevelUpHeaderProps) {
  return (
    <>
      <div className="flex w-full gap-3">
        <BackButton onClick={onBack} />
        <div className="flex flex-col items-start">
          <p className="font-semibold">{title ? title : TITLE_TEXT}</p>
          <p className="text-sm">{SUBTITLE_TEXT_BY_VARIANT[variant]}</p>
        </div>
      </div>
      {progressValue ? (
        <div className="flex w-full justify-center px-6">
          <ProgressField
            value={progressValue}
            stepLabel={stepLabel}
          />
        </div>
      ) : null}
    </>
  )
}
