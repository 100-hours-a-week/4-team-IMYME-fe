import { PvPCard } from '@/entities/pvp-card'

const LIST_CLASSNAME = 'mt-5 flex flex-col items-center gap-4'
export function RecentPvPList() {
  return (
    <div className={LIST_CLASSNAME}>
      <PvPCard
        title="DatabasePvP"
        resultVariant="win"
        opponentName="데베왕"
        categoryName="DB"
        keywordName="Database"
        onClick={() => {}}
        onDelete={() => {}}
      />
    </div>
  )
}
