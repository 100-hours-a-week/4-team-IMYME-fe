'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog'

import type { ReactNode } from 'react'

type AlertModalProps = {
  trigger?: ReactNode
  title: ReactNode
  description?: ReactNode
  action: ReactNode
  cancel: ReactNode
  onAction?: () => void
  onCancel?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AlertModal({
  trigger,
  title,
  description,
  action,
  cancel,
  onAction,
  onCancel,
  open,
  onOpenChange,
}: AlertModalProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={onAction}
            variant={undefined}
            size={undefined}
          >
            {action}
          </AlertDialogAction>
          <AlertDialogCancel
            onClick={onCancel}
            size={undefined}
            variant={undefined}
          >
            {cancel}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
