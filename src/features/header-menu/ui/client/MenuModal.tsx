'use client'

import { type ReactNode } from 'react'

import { ProfileEditButton, LogoutButton, HelpButton } from '@/features/header-menu'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog'

const MODAL_CONTENT_CLASS =
  'sm:max-w-[320px] min-h-[270px] flex flex-col items-center justify-between'

type MenuModalProps = {
  trigger: ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  onClickProfileEdit: () => void
}

export function MenuModal({ trigger, open, onOpenChange, onClickProfileEdit }: MenuModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={MODAL_CONTENT_CLASS}>
        <DialogTitle>설정</DialogTitle>
        <DialogDescription></DialogDescription>
        <ProfileEditButton
          type="button"
          variant="modal_btn_primary"
          onClick={onClickProfileEdit}
        />
        <HelpButton />
        <LogoutButton />
      </DialogContent>
    </Dialog>
  )
}
