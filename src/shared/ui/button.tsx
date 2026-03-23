import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        login: 'bg-primary text-white',
        modal_btn_primary:
          'h-[50px] w-[250px] border border-[rgb(var(--color-primary))] bg-[rgb(var(--color-background))] text-[rgb(var(--color-primary))] hover:bg-primary hover:text-[rgb(var(--color-primary-foreground))] active:bg-primary active:text-[rgb(var(--color-primary-foreground))]',
        mode_btn_primary:
          'inline-flex min-h-[120px] min-w-[350px] cursor-pointer items-center justify-evenly self-center gap-2 border border-[rgb(var(--color-primary))] bg-white text-[rgb(var(--color-primary))] shadow-[0_-2px_1px_rgba(255,255,255,1),0_2px_1px_rgba(0,0,0,0.1)]',
        see_more:
          'bg-background max-w-8 max-h-4 text-sm text-black/50 ml-auto mr-10 cursor-pointer',
        filter_btn: 'w-full bg-secondary text-primary  border-primary cursor-pointer',
        confirm_btn_primary:
          'h-10 w-[100px] border border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))] hover:bg-primary hover:text-[rgb(var(--color-primary-foreground))] active:bg-primary active:text-[rgb(var(--color-primary-foreground))]',
        cancel_btn_primary:
          'h-10 w-[100px] border border-red-500 text-red-500 hover:bg-red-500 hover:text-white active:bg-red-500 active:text-white',
        record_confirm_btn: 'h-10 w-[360px] bg-secondary',
        carousel_btn: 'bg-background cursor-pointer',
        levelup_feedback_btn: 'bg-secondary w-40 h-10 rounded-2xl',
        matching_method_btn: 'w-80 h-20 min-h-20 border-secondary border rounded-xl gap-6',
        pvp_room_enter_btn: 'text-black/50 cursor-pointer pr-4',
        ranking_show_feedback_btn:
          'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_2px_1px_rgba(0,0,0,0.1)]',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
