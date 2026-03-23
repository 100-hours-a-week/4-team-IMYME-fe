import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

type HelpSection = {
  title: string
  description: string
}

const HELP_SECTIONS: HelpSection[] = [
  {
    title: '레벨업 모드',
    description:
      '레벨업 모드는 혼자 공부하고 AI의 피드백을 받아올 수 있는 모드입니다. 한 키워드에 대하여 최대 5번까지 재시도가 가능해요!',
  },
  {
    title: 'PvP 모드',
    description:
      'PvP 모드는 원하는 카테고리를 설정하여 상대방과 1:1 지식 대결을 펼칠 수 있는 모드입니다.',
  },
  {
    title: '챌린지 모드',
    description:
      '챌린지 모드는 매일 밤 10시에 오픈되는 대규모 대결 모드입니다. 매일 챌린지에 도전해보세요!',
  },
  {
    title: '학습 기록',
    description: '레벨업 모드를 학습했던 기록은 마이페이지에서 확인 가능합니다.',
  },
  {
    title: '대결 기록',
    description: 'PvP 모드 대결 기록은 마이페이지에서 확인 가능합니다.',
  },
]

export function HelpPage() {
  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <div className="flex w-full items-center justify-between px-3 py-4">
        <Link
          href="/main"
          className="text-md font-semibold text-[rgb(var(--color-primary))]"
        >
          MINE
        </Link>
      </div>
      <div className="flex w-full items-start gap-3 px-3">
        <Link
          href="/main"
          className="bg-secondary ml-4 flex h-10 w-10 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft
            size={30}
            className="text-primary"
          />
        </Link>
        <p className="font-semibold">도움말</p>
      </div>
      <div className="flex h-full w-full flex-col gap-5 p-10">
        {HELP_SECTIONS.map((section) => (
          <div
            key={section.title}
            className="bg-secondary w-full rounded-2xl p-4"
          >
            <p className="font-semibold">{section.title}</p>
            <p className="text-sm break-keep">{section.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
