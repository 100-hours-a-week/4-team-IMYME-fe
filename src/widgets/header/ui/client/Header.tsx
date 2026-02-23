'use client'

import { Menu } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { MenuModal } from '@/features/header-menu'
import { useMenuModal, useProfileEditModal } from '@/widgets/header'

// ✅ Lazy loaded
// ✅ import 함수를 분리해서 preload에 재사용
const loadProfileEditModal = () => import('@/features/profile-edit').then((m) => m.ProfileEditModal)

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

  const router = useRouter()
  const handleProfileEditRequest = () => {
    handleMenuOpenChange(false)
    handleProfileEditOpen()
  }

  // ✅ menuOpen 시점에 미리 chunk 로드
  useEffect(() => {
    if (menuOpen) {
      loadProfileEditModal()
    }
  }, [menuOpen])

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
