'use client'

import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

type BackButtonProps = {
  onClick?: () => void
}

export function BackButton({ onClick }: BackButtonProps) {
  const router = useRouter()
  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }

    router.back()
  }

  return (
    <button
      type="button"
      className="bg-secondary ml-4 flex h-10 w-10 items-center justify-center rounded-full"
      onClick={handleClick}
    >
      <ChevronLeft
        size={30}
        className="text-primary"
      />
    </button>
  )
}
