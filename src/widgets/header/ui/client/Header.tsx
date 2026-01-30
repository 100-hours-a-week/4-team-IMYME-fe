'use client'

import { Menu } from 'lucide-react'

import { MenuModal } from '@/features/header-menu'
import { ProfileEditModal } from '@/features/profile-edit'
import { useMenuModal, useProfileEditModal } from '@/widgets/header'

type HeaderProps = {
  showMenu?: boolean
}

export function Header({ showMenu = true }: HeaderProps) {
  const { menuOpen, handleMenuOpenChange } = useMenuModal()
  const { profileEditOpen, handleProfileEditOpenChange, handleProfileEditOpen } =
    useProfileEditModal()

  const handleProfileEditRequest = () => {
    handleMenuOpenChange(false)
    handleProfileEditOpen()
  }

  return (
    <header className="flex w-full items-center justify-between px-3 py-4">
      <span className="text-md font-semibold text-[rgb(var(--color-primary))]">MINE</span>
      {showMenu ? (
        <>
          <MenuModal
            trigger={<Menu className="h-5 w-5" />}
            open={menuOpen}
            onOpenChange={handleMenuOpenChange}
            onClickProfileEdit={handleProfileEditRequest}
          />
          {profileEditOpen ? (
            <ProfileEditModal
              open={profileEditOpen}
              onOpenChange={handleProfileEditOpenChange}
            />
          ) : null}
        </>
      ) : (
        <span aria-hidden="true" />
      )}
    </header>
  )
}
