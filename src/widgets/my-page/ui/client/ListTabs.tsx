'use client'

import { ListTab } from '@/shared/ui/ListTab'

type ListTabsProps = {
  activeList: 'learning' | 'pvp'
  onChange: (next: 'learning' | 'pvp') => void
}

const WRAPPER_CLASSNAME = 'mt-4 flex w-full items-center justify-evenly'
export function ListTabs({ activeList, onChange }: ListTabsProps) {
  const isLearningListActive = activeList === 'learning'
  const isPvpListActive = activeList === 'pvp'

  return (
    <div className={WRAPPER_CLASSNAME}>
      <ListTab
        variant="learning"
        isActive={isLearningListActive}
        onSelect={onChange}
      />
      <ListTab
        variant="pvp"
        isActive={isPvpListActive}
        onSelect={onChange}
      />
    </div>
  )
}
