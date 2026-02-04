'use client'

import { Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { MenuModal } from '@/features/header-menu'
import { ProfileEditModal } from '@/features/profile-edit'
import { useMenuModal, useProfileEditModal } from '@/widgets/header'

type HeaderProps = {
  showMenu?: boolean
  goMain?: boolean
}

export function Header({ showMenu = true, goMain = false }: HeaderProps) {
  const { menuOpen, handleMenuOpenChange } = useMenuModal()
  const { profileEditOpen, handleProfileEditOpenChange, handleProfileEditOpen } =
    useProfileEditModal()

  const router = useRouter()
  const handleProfileEditRequest = () => {
    handleMenuOpenChange(false)
    handleProfileEditOpen()
  }

  return (
    <header className="flex w-full items-center justify-between px-3 py-4">
      <span
        className="text-md font-semibold text-[rgb(var(--color-primary))]"
        onClick={() => {
          if (goMain) {
            router.push('/main')
          }
        }}
      >
        MINE
      </span>
      {showMenu ? (
        <>
          <MenuModal
            trigger={<Menu className="h-5 w-5 cursor-pointer" />}
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
