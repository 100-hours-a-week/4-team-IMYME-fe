'use client'

import { useProfile, useSetCardCount } from './useUserStore'

type OptimisticActiveCardCountResult = {
  applyDelta: (delta: number) => void
  applyDeltaWithRollback: (delta: number) => () => void
}

export function useOptimisticActiveCardCount(): OptimisticActiveCardCountResult {
  const profile = useProfile()
  const setCardCount = useSetCardCount()

  const applyDelta = (delta: number) => {
    const currentCount = profile.activeCardCount ?? 0
    const nextCount = Math.max(0, currentCount + delta)
    setCardCount(nextCount)
  }

  const applyDeltaWithRollback = (delta: number) => {
    const previousCount = profile.activeCardCount ?? 0
    const nextCount = Math.max(0, previousCount + delta)
    setCardCount(nextCount)
    return () => setCardCount(previousCount)
  }

  return { applyDelta, applyDeltaWithRollback }
}
