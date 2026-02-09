'use client'

import { cn } from '@/shared/lib/utils'

type StatusMessageProps = {
  message: string
  className?: string
}

export function StatusMessage({ message, className }: StatusMessageProps) {
  return <p className={cn('mt-10 text-center', className)}>{message}</p>
}
