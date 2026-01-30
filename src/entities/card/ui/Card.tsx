'use client'

import { ArrowRight, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type CardProps = {
  id?: number
  title: string
  date: string
  categoryName: string
  keywordName: string
  onClick?: () => void
  onDelete?: () => void
}

const REVEAL_PX = 50
const DRAG_THRESHOLD_PX = 6 // 이 이상 움직이면 "드래그"로 판단

const WRAPPER_CLASSNAME = 'relative w-80 self-center overflow-visible'
const BACK_CLASSNAME = 'absolute right-0 top-0 bottom-0 flex items-center justify-center'
const CARD_CLASSNAME =
  'border-secondary flex h-20 max-h-20 w-80 flex-col items-center justify-center gap-2 rounded-xl border bg-background'
const HEADER_ROW_CLASSNAME = 'mt-2 flex w-full items-center px-4'
const TAG_ROW_CLASSNAME = 'flex w-full items-center px-4'
const TAG_LIST_CLASSNAME = 'flex gap-2'
const TAG_CLASSNAME =
  'bg-secondary text-primary flex h-5 min-w-15 items-center justify-center rounded-2xl px-2 text-xs'

export function Card({ title, date, categoryName, keywordName, onClick, onDelete }: CardProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const [x, setX] = useState(0) // 0 ~ -REVEAL_PX
  const [dragging, setDragging] = useState(false)

  const startXRef = useRef(0)
  const baseXRef = useRef(0)

  // ✅ 드래그/클릭 구분용
  const didDragRef = useRef(false)
  const suppressClickRef = useRef(false)

  const isRevealed = x !== 0

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
  const close = () => setX(0)

  useEffect(() => {
    if (!isRevealed) return

    const onPointerDown = (e: PointerEvent) => {
      const el = wrapperRef.current
      if (!el) return
      if (!el.contains(e.target as Node)) close()
    }

    window.addEventListener('pointerdown', onPointerDown, { capture: true })
    return () => window.removeEventListener('pointerdown', onPointerDown, { capture: true })
  }, [isRevealed])

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(true)
    startXRef.current = e.clientX
    baseXRef.current = x

    didDragRef.current = false
    suppressClickRef.current = false

    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return

    const dx = e.clientX - startXRef.current
    if (Math.abs(dx) > DRAG_THRESHOLD_PX) {
      didDragRef.current = true
    }

    const next = clamp(baseXRef.current + dx, -REVEAL_PX, 0)
    setX(next)
  }

  const handlePointerUp = () => {
    setDragging(false)

    // ✅ 드래그였다면, 뒤이어 발생하는 click을 1회 무시
    if (didDragRef.current) {
      suppressClickRef.current = true
    }

    const shouldOpen = x < -REVEAL_PX / 2
    setX(shouldOpen ? -REVEAL_PX : 0)
  }

  const handleCardClick = () => {
    // ✅ 드래그 직후 발생한 click이면 무시
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    // ✅ 탭으로 닫기
    if (isRevealed) close()

    if (onClick) {
      onClick()
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={WRAPPER_CLASSNAME}
    >
      <div
        className={[
          BACK_CLASSNAME,
          isRevealed ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
          'transition-opacity duration-150',
        ].join(' ')}
        style={{ width: REVEAL_PX }}
      >
        <button
          type="button"
          aria-label="카드 삭제"
          className="flex h-8 w-8 items-center justify-center"
          onClick={(event) => {
            event.stopPropagation()
            if (onDelete) onDelete()
          }}
        >
          <Trash2 className="text-black" />
        </button>
      </div>

      <div
        className={[
          CARD_CLASSNAME,
          'relative z-10 touch-pan-y',
          dragging ? '' : 'transition-transform duration-200 ease-out',
          onClick ? 'cursor-pointer' : '',
        ].join(' ')}
        style={{ transform: `translateX(${x}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleCardClick}
      >
        <div className={HEADER_ROW_CLASSNAME}>
          <p className="font-semibold">{title}</p>
          <p className="ml-auto text-sm">{date}</p>
        </div>

        <div className={TAG_ROW_CLASSNAME}>
          <div className={TAG_LIST_CLASSNAME}>
            <div className={TAG_CLASSNAME}>{categoryName}</div>
            <div className={TAG_CLASSNAME}>{keywordName}</div>
          </div>
          <ArrowRight className="ml-auto" />
        </div>
      </div>
    </div>
  )
}
