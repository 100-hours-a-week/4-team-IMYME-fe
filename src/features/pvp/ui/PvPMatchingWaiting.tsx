'use client'

import { Spinner } from '@/shared'

import { PvPProfile } from './PvPProfile'

type PvPMatchingWaitingProps = {
  leftProfile: {
    name: string
    avatarUrl?: string
  }
  rightProfile: {
    name: string
    avatarUrl?: string
  }
}

const WRAPPER_CLASSNAME = 'mt-30 flex w-full flex-col gap-10'
const STATUS_WRAPPER_CLASSNAME = 'flex w-full flex-col items-center justify-center gap-4'
const SPINNER_WRAPPER_CLASSNAME =
  'bg-secondary flex h-20 w-20 items-center justify-center rounded-full'
const MATCHING_WRAPPER_CLASSNAME = 'flex w-full items-center justify-center gap-20'

export function PvPMatchingWaiting({ leftProfile, rightProfile }: PvPMatchingWaitingProps) {
  return (
    <div className={WRAPPER_CLASSNAME}>
      <div className={STATUS_WRAPPER_CLASSNAME}>
        <div className={SPINNER_WRAPPER_CLASSNAME}>
          <Spinner className="size-8" />
        </div>
        <p className="text-sm">상대를 기다리고 있습니다...</p>
      </div>
      <div className={MATCHING_WRAPPER_CLASSNAME}>
        <PvPProfile
          name={leftProfile.name}
          avatarUrl={leftProfile.avatarUrl}
        />
        <p>VS.</p>
        <PvPProfile
          name={rightProfile.name}
          avatarUrl={rightProfile.avatarUrl}
        />
      </div>
    </div>
  )
}
