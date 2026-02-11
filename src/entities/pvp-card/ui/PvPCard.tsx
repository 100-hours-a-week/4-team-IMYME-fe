'use client'

import { ArrowRight, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type PvPCardProps = {
  title: string
  resultLabel: string
  opponentName: string
  categoryLabel: string
  onClick?: () => void
  onDelete?: () => void
}

const REVEAL_PX = 50
const DRAG_THRESHOLD_PX = 6

const WRAPPER_CLASSNAME = 'relative w-80 self-center overflow-visible'
const BACK_CLASSNAME = 'absolute right-0 top-0 bottom-0 flex items-center justify-center'
const CARD_CLASSNAME =
  'border-secondary bg-background flex h-20 max-h-20 w-80 flex-col items-center justify-center gap-2 rounded-xl border'
const ROW_CLASSNAME = 'flex w-full items-center px-4'
const RESULT_CLASSNAME =
  'bg-secondary text-primary ml-auto flex h-6 min-w-16 items-center justify-center rounded-2xl px-2 text-sm'
const CATEGORY_CLASSNAME =
  'bg-secondary text-primary ml-auto flex h-5 min-w-15 items-center justify-center rounded-2xl px-2 text-xs'
const ARROW_SIZE = 20

export function PvPCard({
  title,
  resultLabel,
  opponentName,
  categoryLabel,
  onClick,
  onDelete,
}: PvPCardProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const [x, setX] = useState(0)
  const [dragging, setDragging] = useState(false)

  const startXRef = useRef(0)
  const baseXRef = useRef(0)

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

    if (didDragRef.current) {
      suppressClickRef.current = true
    }

    const shouldOpen = x < -REVEAL_PX / 2
    setX(shouldOpen ? -REVEAL_PX : 0)
  }

  const handleCardClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
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
        <div className={ROW_CLASSNAME}>
          <p className="font-semibold">{title}</p>
          <div className={RESULT_CLASSNAME}>{resultLabel}</div>
        </div>
        <div className={ROW_CLASSNAME}>
          <p className="text-sm">VS. {opponentName}</p>
          <div className={CATEGORY_CLASSNAME}>{categoryLabel}</div>
          <ArrowRight
            className="ml-2"
            size={ARROW_SIZE}
          />
        </div>
      </div>
    </div>
  )
}
