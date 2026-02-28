'use client'

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import type * as React from 'react'
import { cn } from '@/lib/utils'
import { type GlassThickness, Material } from './material'

export interface ScrollAreaRootProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  material?: boolean | { thickness?: GlassThickness }
  className?: string
}

export interface ScrollAreaViewportProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Viewport> {
  className?: string
}

export interface ScrollAreaScrollbarProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Scrollbar> {
  className?: string
}

export interface ScrollAreaThumbProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaThumb> {
  className?: string
}

export interface ScrollAreaCornerProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Corner> {
  className?: string
}

const ScrollAreaRoot = ({
  className,
  material = false,
  children,
  ...props
}: ScrollAreaRootProps) => {
  const thickness = typeof material === 'object' ? material.thickness : 'normal'

  const content = (
    <ScrollAreaPrimitive.Root className={cn('relative', className)} {...props}>
      {children}
    </ScrollAreaPrimitive.Root>
  )

  if (material) {
    return <Material thickness={thickness}>{content}</Material>
  }

  return content
}

const ScrollAreaViewport = ({ className, children, ...props }: ScrollAreaViewportProps) => (
  <ScrollAreaPrimitive.Viewport
    className={cn('h-full w-full rounded-[inherit]', className)}
    {...props}
  >
    {children}
  </ScrollAreaPrimitive.Viewport>
)

const ScrollAreaScrollbar = ({ className, children, ...props }: ScrollAreaScrollbarProps) => (
  <ScrollAreaPrimitive.Scrollbar
    className={cn(
      '!top-1/2 !h-[min(100%,100px)] !-translate-y-1/2 mr-1 flex touch-none select-none rounded-full bg-[#4d4d4d]/20 transition-colors',
      'after:absolute after:inset-0 after:rounded-full after:bg-[#fafafa]/20 after:[background-blend-mode:color-dodge]',
      'animate-fd-fade-in data-[state=hidden]:animate-fd-fade-out',
      'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-3.5 data-[orientation=vertical]:p-[3px]',
      'data-[orientation=horizontal]:h-3.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:p-[3px]',
      className
    )}
    {...props}
  >
    {children}
  </ScrollAreaPrimitive.Scrollbar>
)

const ScrollAreaThumb = ({ className, ...props }: ScrollAreaThumbProps) => (
  <ScrollAreaPrimitive.ScrollAreaThumb
    className={cn('relative flex-1 rounded-full bg-[#aaaaaa]/50', className)}
    {...props}
  />
)

const ScrollAreaCorner = ({ className, ...props }: ScrollAreaCornerProps) => (
  <ScrollAreaPrimitive.Corner className={cn(className)} {...props} />
)

// Convenience component that includes all parts
export interface ScrollAreaProps extends ScrollAreaRootProps {
  viewportProps?: ScrollAreaViewportProps
  showScrollbar?: boolean
  showCorner?: boolean
}

const ScrollArea = ({
  className,
  children,
  viewportProps,
  showScrollbar = true,
  showCorner = true,
  ...props
}: ScrollAreaProps) => (
  <ScrollAreaRoot className={className} {...props}>
    <ScrollAreaViewport {...viewportProps}>{children}</ScrollAreaViewport>
    {showScrollbar && (
      <ScrollAreaScrollbar>
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    )}
    {showCorner && <ScrollAreaCorner />}
  </ScrollAreaRoot>
)

export {
  ScrollArea,
  ScrollAreaRoot,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaCorner,
}
