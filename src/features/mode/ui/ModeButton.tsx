'use client'

import { useRouter } from 'next/navigation'

import { Button, type ButtonProps } from '@/shared/ui/button'

const MODE_BUTTON_VARIANTS = {
  levelup: {
    icon: '📝',
    label: '레벨업 모드',
  },
  pvp: {
    icon: '⚔️',
    label: 'PVP 모드',
  },
} as const

type ModeButtonVariant = keyof typeof MODE_BUTTON_VARIANTS

type ModeButtonProps = {
  variant?: ModeButtonVariant
} & Omit<ButtonProps, 'variant' | 'children'>

export function ModeButton({ variant = 'levelup', ...props }: ModeButtonProps) {
  const { icon, label } = MODE_BUTTON_VARIANTS[variant]
  const router = useRouter()

  return (
    <Button
      variant={'mode_btn_primary'}
      onClick={() => {
        router.push(`/${variant}`)
      }}
      {...props}
    >
      <span className="ml-4 text-5xl">{icon}</span>
      <span className="text-md mr-4 ml-auto font-semibold">{label}</span>
    </Button>
  )
}
