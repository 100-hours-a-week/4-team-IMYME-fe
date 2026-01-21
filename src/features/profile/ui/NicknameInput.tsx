import { Input } from '@/shared/ui/input'

import type { ChangeEventHandler } from 'react'

const HELPER_TEXT_CLASS = 'text-xs text-muted-foreground'

type NicknameInputProps = {
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
}

export function NicknameInput({ value, onChange }: NicknameInputProps) {
  return (
    <>
      <Input
        type="text"
        placeholder="닉네임을 입력해주세요"
        value={value}
        onChange={onChange}
      />
      <p className={HELPER_TEXT_CLASS}>닉네임은 2~10자로 입력해주세요.</p>
    </>
  )
}
