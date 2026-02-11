'use client'

type ListTabVariant = 'learning' | 'pvp'

type ListTabProps = {
  variant: ListTabVariant
  isActive: boolean
  onSelect: (variant: ListTabVariant) => void
}

const LABEL_BY_VARIANT: Record<ListTabVariant, string> = {
  learning: '학습 목록',
  pvp: '대결 목록',
}

const BASE_TAB_CLASSNAME = 'border-b-3 pb-1 text-base'
const ACTIVE_TAB_CLASSNAME = 'border-secondary text-foreground'
const INACTIVE_TAB_CLASSNAME = 'border-transparent text-[#C9C9C9]'

export function ListTab({ variant, isActive, onSelect }: ListTabProps) {
  const label = LABEL_BY_VARIANT[variant]
  const className = [
    BASE_TAB_CLASSNAME,
    isActive ? ACTIVE_TAB_CLASSNAME : INACTIVE_TAB_CLASSNAME,
  ].join(' ')

  return (
    <button
      type="button"
      className={className}
      aria-pressed={isActive}
      onClick={() => onSelect(variant)}
    >
      {label}
    </button>
  )
}
