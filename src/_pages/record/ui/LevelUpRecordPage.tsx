'use client'

import { Mic } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { LevelUpHeader } from '@/features/levelup'
import { SubjectCard } from '@/shared'
import { Button } from '@/shared/ui/button'

const RECORD_PROGRESS_VALUE = 100
const RECORD_STEP_LABEL = '3/3'

export function LevelUpRecordPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push('/main')
  }

  return (
    <div className="h-full w-full">
      <LevelUpHeader
        variant="recording"
        onBack={handleBack}
        progressValue={RECORD_PROGRESS_VALUE}
        stepLabel={RECORD_STEP_LABEL}
      />
      <div className="mt-6 flex justify-center gap-6">
        <SubjectCard
          variant="category"
          title="학습 중인 카테고리"
          value="자료구조"
        />
        <SubjectCard
          variant="keyword"
          title="학습 중인 키워드"
          value="Stack"
        />
      </div>
      <div className="mt-4 flex w-full flex-col items-center">
        <div className="border-secondary bg-var(--color-background) flex h-90 w-90 flex-col items-center gap-6 rounded-2xl border-2">
          <p className="mt-6 text-sm">음성으로 말해보세요.</p>
          <p className="text-sm">버튼을 눌러 녹음을 시작하세요.</p>
          <div className="border-secondary flex h-40 w-40 items-center justify-center rounded-full border-4">
            <Mic size={100} />
          </div>
        </div>
      </div>
      <div className="mt-4 flex w-full flex-col items-center">
        <div className="border-secondary bg-var(--color-background) flex h-30 w-90 flex-col items-start justify-center gap-1 rounded-2xl border text-start">
          <p className="ml-4">녹음 팁</p>
          <p className="ml-4 text-sm">조용한 장소에서 녹음하세요.</p>
          <p className="ml-4 text-sm">명확하게 발음하세요.</p>
          <p className="ml-4 text-sm">자연스러운 속도로 말하세요.</p>
        </div>
      </div>
      <div className="mt-4 flex w-full items-center justify-center">
        <Button variant="record_confirm_btn">녹음 완료 및 피드백 받기</Button>
      </div>
    </div>
  )
}
