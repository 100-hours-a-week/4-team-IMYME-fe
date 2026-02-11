const DASHBOARD_CARD_CLASSNAME =
  'w-[103px] h-[115px] bg-primary text-white flex flex-col items-center justify-center gap-3 rounded-xl'
const DASHBOARD_INFO_HEADING_CLASSNAME = 'text-2xl font-medium'
const DASHBOARD_INFO_BASE_CLASSNAME = 'text-base'

interface StatCardsProps {
  cardCount: number
  winCount: number
  levelCount: number
}

export function StatCards({ cardCount, winCount, levelCount }: StatCardsProps) {
  return (
    <div className="mt-6 grid grid-cols-3 place-items-center px-3">
      <div className={DASHBOARD_CARD_CLASSNAME}>
        <p className={DASHBOARD_INFO_HEADING_CLASSNAME}>{cardCount}</p>
        <p className={DASHBOARD_INFO_BASE_CLASSNAME}>카드 수</p>
      </div>
      <div className={DASHBOARD_CARD_CLASSNAME}>
        <p className={DASHBOARD_INFO_HEADING_CLASSNAME}>{winCount}</p>
        <p className={DASHBOARD_INFO_BASE_CLASSNAME}>승리</p>
      </div>
      <div className={DASHBOARD_CARD_CLASSNAME}>
        <p className={DASHBOARD_INFO_HEADING_CLASSNAME}>{levelCount}</p>
        <p className={DASHBOARD_INFO_BASE_CLASSNAME}>레벨</p>
      </div>
    </div>
  )
}
