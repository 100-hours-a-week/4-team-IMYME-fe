'use client'

import { useState } from 'react'

import { CancelButton, ConfirmButton, HelperText } from '@/shared'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Field, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'

import { MAX_NAME_LENGTH, validateCardName } from '../model/validateCardName'

type CardNameModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCategoryName: string | null
  selectedKeywordName: string | null
  onCancel: () => void
  onConfirm: (title: string) => void
}

const TITLE_TEXT = '카드 만들기'
const DESCRIPTION_TEXT = '생성할 카드의 이름을 입력해 주세요.'
const FIELD_LABEL_TEXT = '카드 이름'
const FIELD_DESCRIPTION_TEXT = '20자 이하의 문자열로 작성해주세요.'
const INPUT_PLACEHOLDER = '카드 이름을 입력해 주세요.'

export function CardNameModal({
  open,
  onOpenChange,
  selectedCategoryName,
  selectedKeywordName,
  onCancel,
  onConfirm,
}: CardNameModalProps) {
  const [cardName, setCardName] = useState('')
  const validation = validateCardName(cardName)
  const isConfirmDisabled = validation.ok ? false : true

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[80vh] max-w-(--frame-max-width) overflow-y-auto">
        <DialogHeader className="flex items-center gap-6">
          <DialogTitle>{TITLE_TEXT}</DialogTitle>
          <DialogDescription>{DESCRIPTION_TEXT}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center self-center text-left">
          <div className="bg-primary rounded-2xl p-4 text-white">
            <p>선택한 카테고리: {selectedCategoryName}</p>
            <p>선택한 키워드: {selectedKeywordName}</p>
          </div>
          <div className="my-4 flex w-full max-w-8/10 flex-col items-center">
            <Field>
              <FieldLabel
                htmlFor="cardName"
                className="text-md font-semibold"
              >
                {FIELD_LABEL_TEXT}
              </FieldLabel>
              <Input
                id="cardName"
                autoComplete="off"
                placeholder={INPUT_PLACEHOLDER}
                className="border-primary"
                maxLength={MAX_NAME_LENGTH}
                value={cardName}
                onChange={(event) => setCardName(event.target.value)}
              />
              <HelperText
                message={validation.ok ? FIELD_DESCRIPTION_TEXT : validation.reason}
                variant={validation.ok ? 'default' : 'error'}
              />
            </Field>
          </div>
        </div>
        <DialogFooter className="flex w-full flex-row justify-center gap-3 sm:gap-5">
          <ConfirmButton
            disabled={isConfirmDisabled}
            onClick={() => onConfirm(cardName)}
          />
          <CancelButton onClick={onCancel} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
