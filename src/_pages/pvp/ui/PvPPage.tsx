'use client'

import { ModeHeader } from '@/shared'

export function PvPPage() {
  return (
    <div className="h-full w-full">
      <ModeHeader
        mode="pvp"
        step="matching_list"
        onBack={() => {}}
      />
    </div>
  )
}
