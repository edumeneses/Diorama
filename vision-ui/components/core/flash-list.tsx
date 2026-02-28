'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  ScrollAreaCorner,
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from './scrollview'

type FlashListRenderItem<T> = (info: { item: T; index: number }) => React.ReactNode

interface FlashListProps<T> extends React.ComponentPropsWithoutRef<typeof ScrollAreaRoot> {
  data: T[]
  renderItem: FlashListRenderItem<T>
  keyExtractor?: (item: T, index: number) => string
  ListHeaderComponent?: React.ReactNode | (() => React.ReactNode)
  ListFooterComponent?: React.ReactNode | (() => React.ReactNode)
  className?: string
  onEndReached?: () => void
  onEndReachedThreshold?: number // 0..1 of remaining distance
  horizontal?: boolean
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
  rootClassName?: string
}

/** We might use a virtualized list in the future */
function FlashList<T>({
  data,
  renderItem,
  keyExtractor,
  ListHeaderComponent,
  ListFooterComponent,
  className,
  onEndReached,
  onEndReachedThreshold = 0.1,
  horizontal = false,
  onScroll,
  rootClassName,
  ...props
}: FlashListProps<T>) {
  const endReachedRef = React.useRef(false)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScroll?.(e)
    const el = e.currentTarget
    if (horizontal) {
      const remaining = el.scrollWidth - el.clientWidth - el.scrollLeft
      if (!endReachedRef.current && remaining <= el.clientWidth * onEndReachedThreshold) {
        endReachedRef.current = true
        onEndReached?.()
      }
      if (remaining > el.clientWidth * onEndReachedThreshold) endReachedRef.current = false
    } else {
      const remaining = el.scrollHeight - el.clientHeight - el.scrollTop
      if (!endReachedRef.current && remaining <= el.clientHeight * onEndReachedThreshold) {
        endReachedRef.current = true
        onEndReached?.()
      }
      if (remaining > el.clientHeight * onEndReachedThreshold) endReachedRef.current = false
    }
  }

  const header =
    typeof ListHeaderComponent === 'function' ? ListHeaderComponent() : ListHeaderComponent
  const footer =
    typeof ListFooterComponent === 'function' ? ListFooterComponent() : ListFooterComponent

  return (
    <ScrollAreaRoot
      className={cn('-mt-6', horizontal ? 'flex-row' : 'flex-col', rootClassName)}
      onScroll={handleScroll}
      role="list"
      {...props}
    >
      <ScrollAreaViewport
        className={cn(
          '[mask-image:linear-gradient(to_bottom,transparent,black_1.5rem,black_calc(100%-1.5rem),transparent)]',
          'h-[calc(var(--content-height,max(300px,60dvh))-var(--header-height,0px)-var(--footer-height,0px))]',
          className
        )}
      >
        {/* 1.5rem fillter for mask-image */}
        <div className="h-6" />
        {header}
        {data.map((item, index) => (
          <div
            key={
              keyExtractor
                ? keyExtractor(item, index)
                : String((item as unknown as { id?: string }).id ?? index)
            }
            role="listitem"
          >
            {renderItem({ item, index })}
          </div>
        ))}
        {footer}
        <div className="h-6" />
      </ScrollAreaViewport>

      <ScrollAreaScrollbar>
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
      <ScrollAreaCorner />
    </ScrollAreaRoot>
  )
}

export { FlashList }
export type { FlashListRenderItem, FlashListProps }
