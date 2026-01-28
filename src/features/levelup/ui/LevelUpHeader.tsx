'use client'

import { BackButton, ProgressField } from '@/shared'

type HeaderVariant = 'category' | 'keyword'

type LevelUpHeaderProps = {
  variant: HeaderVariant
  onBack: () => void
  progressValue: number
  stepLabel: string
}

const TITLE_TEXT = '레벨업 모드'
const SUBTITLE_TEXT_BY_VARIANT: Record<HeaderVariant, string> = {
  category: '카테고리 선택',
  keyword: '키워드 선택',
}

export function LevelUpHeader({ variant, onBack, progressValue, stepLabel }: LevelUpHeaderProps) {
  return (
    <>
      <div className="flex gap-3">
        <BackButton onClick={onBack} />
        <div className="flex flex-col items-start">
          <p className="font-semibold">{TITLE_TEXT}</p>
          <p className="text-sm">{SUBTITLE_TEXT_BY_VARIANT[variant]}</p>
        </div>
      </div>
      <div className="px-6">
        <ProgressField
          value={progressValue}
          stepLabel={stepLabel}
        />
      </div>
    </>
  )
}
