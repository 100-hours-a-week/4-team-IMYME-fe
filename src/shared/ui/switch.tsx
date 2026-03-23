'use client'

import { Switch as SwitchPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '../lib/utils'

const ROOT_SIZE_CLASS_BY_SIZE = {
  default: 'h-5 w-9',
  sm: 'h-4 w-7',
} as const

const THUMB_CLASS_BY_SIZE = {
  default: 'size-4 data-[state=checked]:translate-x-4',
  sm: 'size-3 data-[state=checked]:translate-x-3',
} as const

function Switch({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: 'sm' | 'default'
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        'peer focus-visible:ring-primary/60 data-[state=checked]:bg-primary inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent p-0.5 transition-colors outline-none focus-visible:ring-2 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-[state=unchecked]:bg-slate-300',
        'data-[state=checked]:border-primary data-[state=unchecked]:border-slate-300',
        ROOT_SIZE_CLASS_BY_SIZE[size],
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block rounded-full bg-white shadow-sm transition-transform data-[state=unchecked]:translate-x-0',
          THUMB_CLASS_BY_SIZE[size],
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
