'use client'

import { type ReactNode, useState } from 'react'

import { LogoutButton } from '@/features/auth'
import { HelpButton } from '@/features/help'
import { ProfileEditButton, ProfileEditModal } from '@/features/profile'
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
  children?: ReactNode
}

export function MenuModal({ trigger }: MenuModalProps) {
  const [open, setOpen] = useState(false)

  const handleMenuOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
  }

  const handleCloseMenu = () => {
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleMenuOpenChange}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={MODAL_CONTENT_CLASS}>
        <DialogTitle>설정</DialogTitle>
        <DialogDescription></DialogDescription>
        <ProfileEditModal
          trigger={<ProfileEditButton />}
          onClose={handleCloseMenu}
        />
        <HelpButton />
        <LogoutButton />
      </DialogContent>
    </Dialog>
  )
}
