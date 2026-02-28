'use client'

import { motion } from 'motion/react'
import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui'
import type * as React from 'react'
import { cn } from '@/lib/utils'
import { type GlassThickness, Material, type MaterialProps } from './material'

interface ViewProps extends React.HTMLAttributes<HTMLDivElement> {
  material?: boolean | { thickness?: GlassThickness }
}

function View({ className, material = false, children, ...rest }: ViewProps) {
  if (material) {
    const thickness = typeof material === 'object' ? material.thickness : 'normal'
    return (
      <Material
        thickness={thickness}
        className={cn('overflow-hidden', className)}
        {...(rest as MaterialProps)}
      >
        {children}
      </Material>
    )
  }
  return (
    <div className={cn('overflow-hidden', className)} {...rest}>
      {children}
    </div>
  )
}

const MotionView = motion.create(View)

interface ScrollViewProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  contentProps?: React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Viewport>
  material?: boolean | { thickness?: GlassThickness }
  className?: string
  contentClassName?: string
}

function ScrollView({
  className,
  children,
  contentProps,
  material = true,
  contentClassName,
  ...rest
}: ScrollViewProps) {
  const body = (
    <ScrollAreaPrimitive.Root className={cn('relative', className)} {...rest}>
      <ScrollAreaPrimitive.Viewport
        className={cn('h-full w-full rounded-[inherit]', contentClassName)}
        {...contentProps}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )

  if (material) {
    const thickness = typeof material === 'object' ? material.thickness : 'normal'
    return <Material thickness={thickness}>{body}</Material>
  }
  return body
}

const MotionScrollView = motion.create(ScrollView)

export { View, ScrollView, MotionView, MotionScrollView }
export type { ViewProps, ScrollViewProps }
