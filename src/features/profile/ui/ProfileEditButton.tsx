import { Button } from '@/shared/ui/button'

import type { ComponentProps } from 'react'

type ProfileEditButtonProps = ComponentProps<typeof Button>

export function ProfileEditButton(props: ProfileEditButtonProps) {
  return (
    <Button
      variant={'modal_btn_primary'}
      {...props}
    >
      프로필 수정
    </Button>
  )
}
