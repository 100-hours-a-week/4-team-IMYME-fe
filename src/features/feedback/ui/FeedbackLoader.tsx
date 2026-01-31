'use client'

import { Spinner } from '@/shared/ui/Spinner'

type FeedbackStatus = 'PENDING'

type FeedbackLoaderProps = {
  status: FeedbackStatus
}

const STATUS_COPY: Record<FeedbackStatus, { title: string; description: string }> = {
  PENDING: {
    title: '음성 변환 중...',
    description: 'AI가 당신의 음성을 변환 중입니다.',
  },
}

const WRAPPER_CLASSNAME = 'mt-4 flex w-full items-center justify-center self-center'
const BOX_CLASSNAME =
  'border-secondary flex h-90 w-90 flex-col items-center justify-center rounded-2xl border'
const INNER_CLASSNAME = 'bg-secondary flex h-20 w-20 items-center justify-center rounded-full'

export function FeedbackLoader({ status }: FeedbackLoaderProps) {
  const copy = STATUS_COPY[status]

  return (
    <div className={WRAPPER_CLASSNAME}>
      <div className={BOX_CLASSNAME}>
        <div className={INNER_CLASSNAME}>
          <Spinner className="size-8" />
        </div>
        <p>{copy.title}</p>
        <p>{copy.description}</p>
      </div>
    </div>
  )
}
