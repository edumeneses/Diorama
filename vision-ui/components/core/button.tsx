import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  cn(
    //* base *//
    'vision-pro-ui-hoverable',
    'relative flex min-h-[44px] min-w-[44px] items-center justify-center',
    'text-[17px] leading-[22px] font-medium',
    'rounded-md ring-offset-white *:pointer-events-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    "[font-feature-settings:'liga'_off,_'clig'_off]",
    //* icon *//
    '[&_svg]:shrink-0',
    '[&_svg]:stroke-[2.25px]',
    '[&_svg]:transition-opacity [&_svg]:duration-300',
    '[&_svg]:disabled:text-[color-mix(in_sRGB,white_10%,#5E5E5E_45%)]',
    //* disabled *//
    'disabled:pointer-events-none disabled:text-[color-mix(in_sRGB,white_10%,#5E5E5E_45%)]',
    //* before *//
    'before:[filter:blur(0.25px)] before:absolute before:inset-0 before:z-0 before:rounded-[var(--radius)]',
    'before:disabled:[linear-gradient(0deg,rgba(94,94,94,0.07)_0%,rgba(94,94,94,0.07)_100%),rgba(255,255,255,0.04)]',
    'before:[transform:translateX(var(--btn-bg-translate-x))_translateY(var(--btn-bg-translate-y))]',
    'before:[background-blend-mode:color-dodge,lighten] before:transition-opacity before:duration-300',
    'before:[background:linear-gradient(0deg,rgba(94,94,94,0.24)_0%,rgba(94,94,94,0.24)_100%),rgba(255,255,255,0.12)]',
    'before:opacity-0'
  ),
  {
    variants: {
      /**
       * @default "default"
       */
      variant: {
        default: cn(
          'text-foreground/90',
          //* icon *//
          '[&_svg]:text-foreground',
          '[&_svg]:opacity-[0.96]',
          //* before *//
          'before:opacity-75 hover:before:opacity-[0.96]'
        ),
        primary: cn(
          'text-primary-foreground/90 bg-primary/90',
          //* hover focus active *//
          'hover:text-primary-foreground focus:text-primary-foreground active:text-primary-foreground',
          //* icon *//
          '[&_svg]:text-primary-foreground',
          '[&_svg]:opacity-[0.96]',
          //* before *//
          'before:[background:var(--primary)]',
          'before:opacity-15 hover:before:opacity-[0.15]'
        ),
        secondary: cn(
          'text-foreground/50 hover:text-foreground/95 transition-colors',
          //* icon *//
          '[&_svg]:text-foreground',
          '[&_svg]:opacity-60',
          '[&_svg]:hover:opacity-[0.96]',
          //* before *//
          'hover:before:opacity-50',
          'hover:before:[background:linear-gradient(0deg,rgba(94,94,94,0.24)_0%,rgba(94,94,94,0.24)_100%),rgba(255,255,255,0.12)]',
          //* before[data-active]
          '[&[data-active=true]]:before:opacity-40',
          '[&[data-active=true]]:hover:before:[background:linear-gradient(0deg,rgba(94,94,94,0.24)_0%,rgba(94,94,94,0.24)_100%),rgba(255,255,255,0.12)]'
        ),
        /* bg-destructive text-destructive-foreground */
        destructive: cn(
          'text-destructive/90',
          //* hover focus active *//
          'hover:text-destructive focus:text-destructive active:text-destructive',
          'hover:bg-destructive/15 focus:bg-destructive/15 active:bg-destructive/15',
          //* icon *//
          '[&_svg]:text-destructive',
          '[&_svg]:opacity-70',
          '[&_svg]:hover:opacity-[0.96]',
          //* before *//
          'hover:before:opacity-50 before:opacity-0',
          'hover:before:[background:linear-gradient(0deg,rgba(94,94,94,0.24)_0%,rgba(94,94,94,0.24)_100%),rgba(255,255,255,0.12)]'
        ),
        selected: cn(
          'text-background/[0.96]',
          //* icon *//
          '[&_svg]:text-background [&_svg]:z-[1]',
          'before:[background:var(--foreground)] before:text-background/90',
          'hover:before:opacity-100 before:opacity-100'
        ),
        link: cn(
          'text-[#5ac8f5]',
          //* icon *//
          '[&_svg]:text-[#5ac8f5]',
          '[&_svg]:opacity-70',
          '[&_svg]:hover:opacity-[0.96]',
          //* before *//
          'hover:before:opacity-50 before:opacity-0',
          'hover:before:[background:linear-gradient(0deg,rgba(94,94,94,0.24)_0%,rgba(94,94,94,0.24)_100%),rgba(255,255,255,0.12)]'
        ),
      },
      /**
       * @default "default"
       */
      size: {
        default: 'h-[2.75rem] px-[20px]',
        icon: 'h-[2.75rem] w-[2.75rem] [--radius:50%]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

type ButtonVariant = VariantProps<typeof buttonVariants>

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariant {
  asChild?: boolean
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

function ButtonGroup({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 p-3',
        '*:rounded-full [&_button:before]:rounded-full',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Button, buttonVariants, ButtonGroup }
export type { ButtonVariant, ButtonProps }
