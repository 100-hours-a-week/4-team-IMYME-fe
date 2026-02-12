'use client'

type CardInfoProps = {
  createdAt: string
  bestLevel: number | null
  attemptNo: number | null
  attemptCount: number | null
}

const INFO_ROW_CLASSNAME = 'mt-2 flex justify-center gap-6'
const INFO_ITEM_CLASSNAME = 'w-40 text-center text-sm font-semibold'
const ATTEMPT_INFO_CLASSNAME = 'self-center py-3 text-sm'

export function CardInfo({ createdAt, bestLevel, attemptNo, attemptCount }: CardInfoProps) {
  return (
    <>
      <div className={INFO_ROW_CLASSNAME}>
        <div className={INFO_ITEM_CLASSNAME}>{createdAt}</div>
        <div className={INFO_ITEM_CLASSNAME}>최고 성취도: Lv.{bestLevel ?? '-'}</div>
      </div>
      <div className={ATTEMPT_INFO_CLASSNAME}>
        <p>
          {' '}
          {attemptNo ?? 0} of {attemptCount ?? 0}
        </p>
      </div>
    </>
  )
}
