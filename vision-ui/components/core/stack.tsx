'use client'

import { Slot } from '@radix-ui/react-slot'
import type * as React from 'react'
import { cn } from '@/lib/utils'
import type { GlassThickness } from './material'
import { Text } from './text'
import { View } from './view'

type HeaderConfig = {
  /** @default true */
  headerShown?: boolean
  headerLeft?: React.ReactNode | (() => React.ReactNode)
  headerRight?: React.ReactNode | (() => React.ReactNode)
  title?: string
}

type StackScreenProps = {
  name: string
}

type StackProps = {
  children: React.ReactNode
  className?: string
  options?: HeaderConfig
  asChild?: boolean
  material?: boolean | { thickness?: GlassThickness }
}

const DEFAULT_OPTIONS: HeaderConfig = {
  headerShown: true,
  headerLeft: null,
  headerRight: null,
  title: undefined,
}

// Stack Navigator Component
const Stack = ({ children, className, options, asChild = false, material = false }: StackProps) => {
  const { headerShown, headerLeft, headerRight, title } = { ...DEFAULT_OPTIONS, ...options }

  const Comp = asChild ? Slot : View

  return (
    <Comp
      material={material}
      className={cn(
        'flex flex-col',
        !asChild && 'h-[var(--content-height,max(300px,60dvh))]',
        className
      )}
      style={
        {
          '--header-height': headerShown ? '4.5rem' : '0px',
        } as React.CSSProperties
      }
    >
      {/* Header */}
      {headerShown && (
        <div
          className={cn(
            'absolute inset-x-0 top-0 z-10 flex items-start justify-between p-5',
            'ml-[var(--sidebar-width)]'
          )}
        >
          <div className="flex min-w-[64px] items-center justify-start">
            {typeof headerLeft === 'function' ? headerLeft() : headerLeft}
          </div>
          <div className="flex-1 pt-1 text-center">
            <Text size="title1">{title}</Text>
          </div>
          <div className="flex min-w-[64px] items-center justify-end">
            {typeof headerRight === 'function' ? headerRight() : headerRight}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={cn('relative flex-1', headerShown && 'pt-[var(--header-height)]')}>
        {children}
      </div>
    </Comp>
  )
}

export { Stack }
export type { HeaderConfig, StackScreenProps, StackProps }
