'use client'

import { Field, FieldDescription, FieldLabel, Input } from '@/shared'

type RoomNameSettingProps = {
  selectedCategoryName?: string
  roomName: string
  onRoomNameChange: (value: string) => void
  disabled?: boolean
}

const WRAPPER_CLASSNAME = 'max-w-[70vh]'
const HEADER_CLASSNAME = 'mt-5'
const HEADER_TEXT_CLASSNAME = 'mr-auto ml-10 text-base'
const FIELD_WRAPPER_CLASSNAME =
  'mt-2 flex h-full w-full flex-1 flex-col items-center justify-center'
const FIELD_CLASSNAME = 'w-87.5 max-w-87.5'

export function RoomNameSetting({
  selectedCategoryName,
  roomName,
  onRoomNameChange,
  disabled = false,
}: RoomNameSettingProps) {
  return (
    <div className={WRAPPER_CLASSNAME}>
      <div className={HEADER_CLASSNAME}>
        <p className={HEADER_TEXT_CLASSNAME}>{selectedCategoryName ?? ''} 카테고리</p>
      </div>
      <div className={FIELD_WRAPPER_CLASSNAME}>
        <Field className={FIELD_CLASSNAME}>
          <FieldLabel
            htmlFor="roomName"
            className="text-base"
          >
            방 이름
          </FieldLabel>
          <Input
            id="roomName"
            placeholder="방 이름을 입력해주세요."
            className="border-secondary"
            value={roomName}
            onChange={(event) => onRoomNameChange(event.target.value)}
            disabled={disabled}
          />
          <FieldDescription>방 이름은 1자 이상 10자 이하로 입력해주세요.</FieldDescription>
          <FieldDescription>비방/욕설이 담긴 단어는 포함하실 수 없습니다.</FieldDescription>
        </Field>
      </div>
    </div>
  )
}
