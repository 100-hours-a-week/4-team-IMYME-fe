import { Menu } from 'lucide-react'

import { MenuModal } from '@/widgets/menu'

type HeaderProps = {
  showMenu?: boolean
}

export function Header({ showMenu = true }: HeaderProps) {
  return (
    <header className="flex w-full items-center justify-between px-3 py-4">
      <span className="text-md font-semibold text-[rgb(var(--color-primary))]">MINE</span>
      {showMenu ? (
        <MenuModal trigger={<Menu className="h-5 w-5" />} />
      ) : (
        <span aria-hidden="true" />
      )}
    </header>
  )
}
