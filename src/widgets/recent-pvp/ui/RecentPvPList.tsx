import { PvPCard } from '@/entities/pvp-card'

const LIST_CLASSNAME = 'mt-5 flex flex-col items-center gap-4'
export function RecentPvPList() {
  return (
    <div className={LIST_CLASSNAME}>
      <PvPCard
        title="DatabasePvP"
        resultLabel="Win"
        opponentName="데베왕"
        categoryLabel="DB"
        onClick={() => {}}
        onDelete={() => {}}
      />
    </div>
  )
}
