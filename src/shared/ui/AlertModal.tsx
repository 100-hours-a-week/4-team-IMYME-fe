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
      <AlertDialogContent
        size="sm"
        className="flex flex-col items-center bg-white"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={onAction}
            variant="confirm_btn_primary"
            size={undefined}
          >
            {action}
          </AlertDialogAction>
          <AlertDialogCancel
            onClick={onCancel}
            size={undefined}
            variant="cancel_btn_primary"
          >
            {cancel}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
