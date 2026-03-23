type ChallengeKeywordCardProps = {
  variant: 'today' | 'yesterday'
  keyword: string
}

const KEYWORD_CARD_CLASSNAME =
  'bg-secondary flex h-22.5 w-80 flex-col items-center justify-center gap-2 self-center rounded-xl shadow-[0_-2px_1px_rgba(255,255,255,1),0_2px_1px_rgba(0,0,0,0.1)]'
const TITLE_CLASSNAME = 'text-sm'
const KEYWORD_CLASSNAME = 'text-lg font-semibold'
const TITLE_BY_VARIANT = {
  today: '오늘의 키워드',
  yesterday: '어제의 키워드',
} as const

export function ChallengeKeywordCard({ variant, keyword }: ChallengeKeywordCardProps) {
  return (
    <div className={KEYWORD_CARD_CLASSNAME}>
      <p className={TITLE_CLASSNAME}>{TITLE_BY_VARIANT[variant]}</p>
      <p className={KEYWORD_CLASSNAME}>{keyword}</p>
    </div>
  )
}
