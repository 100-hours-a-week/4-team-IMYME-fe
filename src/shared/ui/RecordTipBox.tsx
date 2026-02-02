const CONTAINER_CLASSNAME = 'mt-4 flex w-full flex-col items-center'
const BOX_CLASSNAME =
  'border-secondary bg-var(--color-background) flex h-30 w-90 flex-col items-start justify-center gap-1 rounded-2xl border text-start'
const TITLE_CLASSNAME = 'ml-4'
const TIP_CLASSNAME = 'ml-4 text-sm'

export function RecordTipBox() {
  return (
    <div className={CONTAINER_CLASSNAME}>
      <div className={BOX_CLASSNAME}>
        <p className={TITLE_CLASSNAME}>💡 녹음 팁</p>
        <p className={TIP_CLASSNAME}>조용한 장소에서 녹음하세요.</p>
        <p className={TIP_CLASSNAME}>명확하게 발음하세요.</p>
        <p className={TIP_CLASSNAME}>자연스러운 속도로 말하세요.</p>
      </div>
    </div>
  )
}
