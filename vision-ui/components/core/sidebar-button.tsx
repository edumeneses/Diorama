'use client'

import Link from 'next/link'
import type * as React from 'react'
import { Button } from './button'
import { Text } from './text'

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

type SidebarItemProps = SidebarItem | SidebarLink

type SidebarButtonProps = {
  item: SidebarItemProps
  isActive?: boolean
  className?: string
}

// Helper functions to extract properties from sidebar items
const isSidebarItem = (item: SidebarItemProps): item is SidebarItem => {
  return typeof item === 'object' && !('href' in item)
}

const isSidebarLink = (item: SidebarItemProps): item is SidebarLink => {
  return typeof item === 'object' && 'href' in item
}

const SidebarButtonContent = ({ item }: { item: SidebarItemProps }) => (
  <>
    <div className="relative flex-shrink-0 [&_[data-slot='icon']]:size-6" aria-hidden="true">
      {item.icon}
    </div>
    <div className="ml-4 flex flex-1 items-center justify-between overflow-hidden text-start">
      <Text
        size="title3"
        variant="secondary"
        className="line-clamp-1 w-fit min-w-[60px] truncate font-medium"
      >
        {item.title || item.name}
      </Text>
      {item.badge && (
        <div className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/20 px-1.5">
          <Text size="caption1" variant="secondary" className="text-white/90">
            {item.badge}
          </Text>
        </div>
      )}
    </div>
  </>
)

export const SidebarButton = ({ item, isActive = false, className }: SidebarButtonProps) => {
  const isDisabled = item.disabled

  if (isSidebarLink(item)) {
    return (
      <Button
        className={className}
        variant={isActive ? 'default' : 'secondary'}
        disabled={isDisabled}
        aria-label={item.title || item.name}
        asChild
      >
        <Link href={item.href}>
          <SidebarButtonContent item={item} />
        </Link>
      </Button>
    )
  }

  if (isSidebarItem(item)) {
    return (
      <Button
        className={className}
        variant={isActive ? 'default' : 'secondary'}
        disabled={isDisabled}
        aria-label={item.title || item.name}
        onClick={item.onClick}
      >
        <SidebarButtonContent item={item} />
      </Button>
    )
  }

  return null
}
