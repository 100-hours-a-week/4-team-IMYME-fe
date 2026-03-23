'use client'

import { Menu } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import { useMenuModal, useProfileEditModal } from '@/widgets/header'

const MENU_BUTTON_ARIA_LABEL = '메뉴 열기'

const loadMenuModal = () =>
  import('@/features/header-menu/ui/client/MenuModal').then((module) => module.MenuModal)

const MenuModalLazy = dynamic(loadMenuModal, {
  ssr: false,
  loading: () => null,
})

// ✅ Lazy loaded
// ✅ import 함수를 분리해서 preload에 재사용
const loadProfileEditModal = () =>
  import('@/features/profile-edit/ui/ProfileEditModal').then((module) => module.ProfileEditModal)

const ProfileEditModalLazy = dynamic(loadProfileEditModal, {
  // 모달은 클릭 후 뜨는 UI라 SSR 필요 없음(클라 전용 컴포넌트이면 특히)
  ssr: false,
  // 모달 컴포넌트 로딩 중 표시(원하면 스피너/스켈레톤으로 교체)
  loading: () => null,
})

type HeaderProps = {
  showMenu?: boolean
  goMain?: boolean
}

export function Header({ showMenu = true, goMain = false }: HeaderProps) {
  const { menuOpen, handleMenuOpenChange } = useMenuModal()
  const { profileEditOpen, handleProfileEditOpenChange, handleProfileEditOpen } =
    useProfileEditModal()
  const [hasRequestedMenuModalLoad, setHasRequestedMenuModalLoad] = useState(false)
  const [hasRequestedProfileEditModalLoad, setHasRequestedProfileEditModalLoad] = useState(false)

  const router = useRouter()
  const requestMenuModalLoad = useCallback(() => {
    if (hasRequestedMenuModalLoad) return
    setHasRequestedMenuModalLoad(true)
    void loadMenuModal()
  }, [hasRequestedMenuModalLoad])

  const handleMenuTriggerMouseEnter = () => {
    requestMenuModalLoad()
  }

  const handleMenuTriggerClick = () => {
    requestMenuModalLoad()
    handleMenuOpenChange(true)
  }

  const requestProfileEditModalLoad = useCallback(() => {
    if (hasRequestedProfileEditModalLoad) return
    setHasRequestedProfileEditModalLoad(true)
  }, [hasRequestedProfileEditModalLoad])

  const handleProfileEditRequest = () => {
    requestProfileEditModalLoad()
    handleMenuOpenChange(false)
    handleProfileEditOpen()
  }

  return (
    <header className="flex w-full items-center justify-between px-3 py-4">
      <span
        className="text-md cursor-pointer font-semibold text-[rgb(var(--color-primary))]"
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
          <button
            type="button"
            aria-label={MENU_BUTTON_ARIA_LABEL}
            onMouseEnter={handleMenuTriggerMouseEnter}
            onFocus={handleMenuTriggerMouseEnter}
            onClick={handleMenuTriggerClick}
          >
            <Menu className="h-5 w-5 cursor-pointer" />
          </button>
          {hasRequestedMenuModalLoad ? (
            <MenuModalLazy
              open={menuOpen}
              onOpenChange={handleMenuOpenChange}
              onClickProfileEdit={handleProfileEditRequest}
              onMouseEnterProfileEditButton={requestProfileEditModalLoad}
            />
          ) : null}
          {hasRequestedProfileEditModalLoad ? (
            <ProfileEditModalLazy
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
