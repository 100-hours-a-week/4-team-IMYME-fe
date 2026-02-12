'use client'

type SubjectCardVariant = 'category' | 'keyword'

type SubjectCardProps = {
  variant: SubjectCardVariant
  title: string
  value: string
}

const VARIANT_TITLE: Record<SubjectCardVariant, string> = {
  category: '학습 중인 카테고리',
  keyword: '학습 중인 키워드',
}

const CARD_CLASSNAME =
  'border-secondary flex h-20 w-40 flex-col items-center justify-start text-center gap-2 rounded-2xl border bg-white overflow-scroll'

export function SubjectCard({ variant, title, value }: SubjectCardProps) {
  const displayTitle = title || VARIANT_TITLE[variant]

  return (
    <div className={CARD_CLASSNAME}>
      <p className="pt-1 text-sm">{displayTitle}</p>
      <p className="font-semibold">{value}</p>
    </div>
  )
}
