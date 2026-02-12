'use client'

import { useRouter } from 'next/navigation'

import { ModeHeader } from '@/shared'
import { PvPMatchingCreate } from '@/widgets/pvp-matching-create'

export function PvPRoomCreatePage() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="flex h-full w-full flex-col">
      <ModeHeader
        mode="pvp"
        step="matching_create"
        onBack={handleBack}
      />
      <PvPMatchingCreate />
    </div>
  )
}
