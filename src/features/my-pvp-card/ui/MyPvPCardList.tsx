'use client'

import { PvPCard } from '@/entities/pvp-card'

const LIST_CLASSNAME = 'mt-4 flex max-h-[60vh] min-h-0 flex-col items-center gap-4 overflow-y-auto'

export function MyPvPCardList() {
  return (
    <div className={LIST_CLASSNAME}>
      <PvPCard
        title="DB대결"
        resultVariant="win"
        categoryName="DB"
        keywordName="Database"
        opponentName="데베왕"
      />
    </div>
  )
}
