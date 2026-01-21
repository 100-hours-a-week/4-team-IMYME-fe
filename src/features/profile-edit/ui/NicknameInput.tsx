import { HelperText } from '@/features/help'
import { Input } from '@/shared/ui/input'

import type { ChangeEventHandler, FocusEventHandler } from 'react'

type NicknameInputProps = {
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  helperMessage?: string | null
  helperVariant?: 'default' | 'error'
}

export function NicknameInput({
  value,
  onChange,
  onBlur,
  helperMessage = null,
  helperVariant = 'default',
}: NicknameInputProps) {
  return (
    <>
      <Input
        type="text"
        placeholder="닉네임을 입력해주세요"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        minLength={2}
      />
      <div className="flex min-h-4 w-full">
        {helperMessage ? (
          <HelperText
            message={helperMessage}
            variant={helperVariant}
          />
        ) : null}
      </div>
    </>
  )
}
