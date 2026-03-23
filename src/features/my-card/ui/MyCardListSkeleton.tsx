const LOADING_CARD_SKELETON_COUNT = 5

const LIST_CLASSNAME = 'mt-4 flex min-h-0 max-h-[60vh] flex-col items-center gap-4 overflow-y-auto'
const CARD_SKELETON_CLASSNAME =
  'border-secondary flex h-20 max-h-20 w-80 flex-col justify-center gap-2 rounded-xl border bg-background px-4'
const HEADER_ROW_CLASSNAME = 'flex w-full items-center'
const TAG_ROW_CLASSNAME = 'flex w-full items-center'
const TAG_LIST_CLASSNAME = 'flex gap-2'
const SKELETON_BASE_CLASSNAME = 'animate-pulse rounded-md bg-gray-200'

export function MyCardListSkeleton() {
  return (
    <div className={LIST_CLASSNAME}>
      {Array.from({ length: LOADING_CARD_SKELETON_COUNT }, (_, index) => (
        <div
          key={`my-card-skeleton-${index}`}
          className={CARD_SKELETON_CLASSNAME}
          aria-hidden="true"
        >
          <div className={HEADER_ROW_CLASSNAME}>
            <div className={`${SKELETON_BASE_CLASSNAME} h-4 w-32`} />
            <div className={`${SKELETON_BASE_CLASSNAME} ml-auto h-3.5 w-20`} />
          </div>
          <div className={TAG_ROW_CLASSNAME}>
            <div className={TAG_LIST_CLASSNAME}>
              <div className={`${SKELETON_BASE_CLASSNAME} h-5 w-16 rounded-2xl`} />
              <div className={`${SKELETON_BASE_CLASSNAME} h-5 w-16 rounded-2xl`} />
            </div>
            <div className={`${SKELETON_BASE_CLASSNAME} ml-auto h-5 w-5 rounded-full`} />
          </div>
        </div>
      ))}
    </div>
  )
}
