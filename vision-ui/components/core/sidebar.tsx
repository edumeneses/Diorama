'use client'

import { IconChevronRight } from '@tabler/icons-react'
import { AnimatePresence } from 'motion/react'
import { usePathname } from 'next/navigation'
import { Collapsible } from 'radix-ui'
import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { FlashList } from './flash-list'
import { SidebarButton } from './sidebar-button'
import { Text } from './text'
import { MotionView, View } from './view'

type SidebarItem = {
  name: string
  icon?: React.ReactNode
  title?: string
  badge?: string | number
  disabled?: boolean
  onClick?: () => void
}

type SidebarLink = {
  name: string
  href: string
  icon?: React.ReactNode
  title?: string
  badge?: string | number
  disabled?: boolean
}

type SidebarSection = {
  title: string
  items: (SidebarItem | SidebarLink)[]
  defaultOpen?: boolean
}

type SidebarItemProps = SidebarItem | SidebarLink | SidebarSection

type SidebarProps = {
  children: React.ReactNode
  className?: string
  position?: 'left' | 'right'
  collapsible?: boolean
  items: SidebarItemProps[]
  header?: React.ReactNode
  footer?: React.ReactNode
  listRootClassName?: string
  listClassName?: string
}

// Helper functions to extract properties from sidebar items
const isSidebarItem = (item: SidebarItemProps): item is SidebarItem => {
  return typeof item === 'object' && !('href' in item) && !('items' in item)
}

const isSidebarLink = (item: SidebarItemProps): item is SidebarLink => {
  return typeof item === 'object' && 'href' in item
}

const isSidebarSection = (item: SidebarItemProps): item is SidebarSection => {
  return typeof item === 'object' && 'items' in item
}

const extractItemName = (item: SidebarItemProps, index: number): string => {
  if (isSidebarItem(item) || isSidebarLink(item)) {
    return item.name
  }
  if (isSidebarSection(item)) {
    // Use index to ensure unique keys for sections with same title
    return `${item.title}-${index}`
  }
  return `item-${index}`
}

// CollapsibleSection component
type CollapsibleSectionProps = {
  title: string
  items: (SidebarItem | SidebarLink)[]
  activeItem: SidebarItem | SidebarLink | null
  defaultOpen?: boolean
}

const CollapsibleSection = ({
  title,
  items,
  activeItem,
  defaultOpen = true,
}: CollapsibleSectionProps) => {
  const [open, setOpen] = React.useState(defaultOpen)

  const renderSidebarItem = (item: SidebarItem | SidebarLink) => {
    const isActive = activeItem?.name === item.name

    return (
      <SidebarButton
        key={item.name}
        item={item}
        isActive={isActive}
        className="flex w-full items-center justify-stretch px-[10px]"
      />
    )
  }

  return (
    <Collapsible.Root className="w-full" open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <Button className="flex w-full items-center justify-between px-[10px]" variant="secondary">
          <Text size="body">{title}</Text>
          <MotionView
            initial={false}
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <IconChevronRight />
          </MotionView>
        </Button>
      </Collapsible.Trigger>

      <Collapsible.Content forceMount asChild>
        <AnimatePresence initial={false}>
          {open && (
            <MotionView
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.75, type: 'spring', bounce: 0 }}
            >
              {items.map(renderSidebarItem)}
            </MotionView>
          )}
        </AnimatePresence>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
// Find active item - exact match
const findActiveItem = (
  items: SidebarItemProps[],
  pathname: string
): SidebarItem | SidebarLink | null => {
  for (const item of items) {
    if (isSidebarLink(item)) {
      console.log('item.href', item.href)
      console.log('pathname', pathname)
      if (pathname === item.href) {
        return item
      }
    }
    if (isSidebarSection(item)) {
      const activeInSection = findActiveItem(item.items, pathname)
      if (activeInSection) {
        return activeInSection
      }
    }
  }
  return null
}

// Render sidebar item
const renderSidebarItem = ({
  item,
  index,
  activeItem,
}: {
  item: SidebarItemProps
  index: number
  activeItem: SidebarItem | SidebarLink | null
}) => {
  switch (true) {
    case isSidebarItem(item):
    case isSidebarLink(item): {
      const isActive = activeItem?.name === item.name

      return (
        <SidebarButton
          key={item.name}
          item={item}
          isActive={isActive}
          className="flex w-full items-center justify-stretch px-[10px]"
        />
      )
    }

    case isSidebarSection(item): {
      return (
        <CollapsibleSection
          key={`${item.title}-${index}`}
          title={item.title}
          items={item.items}
          activeItem={activeItem}
        />
      )
    }

    default:
      return null
  }
}

const Sidebar = ({
  children,
  className,
  position = 'left',
  collapsible = true,
  items,
  header,
  footer,
  listRootClassName,
  listClassName,
}: SidebarProps) => {
  const pathname = usePathname()

  const activeItem = findActiveItem(items, pathname)

  const isLeft = position === 'left'

  return (
    <View
      material
      data-sidebar="root"
      style={
        {
          '--sidebar-width': '280px',
          '--sidebar-header-height': header ? '4.75rem' : '0px',
          // Inherit the height of the content, if exists
          '--sidebar-height': 'var(--content-height,max(300px,60dvh))',
        } as React.CSSProperties
      }
      className={cn(
        'isolate grid w-full flex-1',
        'min-h-[var(--sidebar-height)]',
        isLeft && 'grid-cols-[var(--sidebar-width)_1fr]',
        !isLeft && 'grid-cols-[1fr_var(--sidebar-width)]',
        'max-w-7xl xl:max-w-8xl 2xl:max-w-9xl',
        'before:pointer-events-none before:absolute before:inset-0 before:z-[10] before:rounded-[var(--radius)] before:content-[""]',
        'before:bg-[rgba(0,0,0,var(--overlay-opacity))]',
        // reset the overlay opacity because
        // we've handled it in the parent
        '*:[--overlay-opacity:0]',
        className
      )}
    >
      <View data-sidebar="sidebar" className="flex flex-col bg-black/10 bg-blend-color-dodge">
        {header && header}
        {/* Sidebar */}
        <FlashList
          data={items}
          renderItem={({ item, index }) => renderSidebarItem({ item, index, activeItem })}
          keyExtractor={(item, index) => extractItemName(item, index)}
          rootClassName={cn(header && 'pt-[var(--sidebar-header-height)]', listRootClassName)}
          className={cn(
            'h-[calc(var(--sidebar-height)-var(--sidebar-header-height))] space-y-1 px-2',
            listClassName
          )}
        />
        {footer && <View className="absolute inset-x-0 bottom-0 z-[2] mb-6 px-6">{footer}</View>}
      </View>

      {/* Content Area */}
      {children}
    </View>
  )
}

type SidebarHeaderProps = {
  title?: string
  className?: string
  children?: React.ReactNode
  headerRight?: React.ReactNode | (() => React.ReactNode)
}

const SidebarHeader = ({ title, className, children, headerRight }: SidebarHeaderProps) => {
  return (
    <View
      data-sidebar="header"
      className={cn('absolute inset-x-0 top-0 z-10 p-5', 'w-[var(--sidebar-width)]', className)}
    >
      <View className="flex items-start justify-between overflow-visible">
        {title && (
          <Text size="title1" className="pt-1">
            {title}
          </Text>
        )}
        {headerRight && (
          <div className="flex items-center justify-center">
            {typeof headerRight === 'function' ? headerRight() : headerRight}
          </div>
        )}
      </View>
      {children}
    </View>
  )
}

export { Sidebar, SidebarHeader }
export type { SidebarItemProps, SidebarProps, SidebarItem, SidebarLink, SidebarSection }
