'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type * as React from 'react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Text } from './text'
import { MotionView } from './view'

const CONSTANTS = {
  EXPANDED_WIDTH: 'fit-content',
  COLLAPSED_WIDTH: 44,
  ENTERANCE_TIMEOUT: 700,
  EXITANCE_TIMEOUT: 500,
  TAB_EXIT_TIMEOUT: 480,
  TEXT_TRANSITION_CONFIG: {
    duration: 0.4,
  },
} as const

const ORNAMENT_VARIANTS = {
  collapsed: {
    width: CONSTANTS.COLLAPSED_WIDTH,
    scale: 1.0,
    transition: {
      delay: 0.8,
      type: 'spring',
      bounce: 0,
    },
  },
  expanded: {
    width: CONSTANTS.EXPANDED_WIDTH,
    scale: 1.05,
    transition: {
      type: 'spring',
      bounce: 0.06,
      duration: 0.7,
    },
  },
  whileTap: {
    scale: 1,
    type: 'spring',
    bounce: 0.1,
    duration: 0.4,
  },
} as const

export type OrnamentTabProps = {
  name: string
  href: string
  icon?: React.ReactNode
  title?: string
}

export type OrnamentProps = {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  orientation?: 'vertical' | 'horizontal'
  position?: 'left' | 'right' | 'top' | 'bottom'
  floating?: boolean
  tabs: OrnamentTabProps[]
}

const Ornament = ({
  children,
  className,
  contentClassName,
  orientation = 'vertical',
  position = 'left',
  floating = true,
  tabs,
}: OrnamentProps) => {
  const pathname = usePathname()
  const [tapped, setTapped] = useState(false)

  let activeTab = tabs.find((tab) => pathname === tab.href)
  if (!activeTab) {
    activeTab = tabs.find((tab) => pathname.startsWith(`${tab.href}/`))
  }

  const isVertical = orientation === 'vertical'
  const isLeft = position === 'left'

  return (
    <div
      data-ornament="root"
      className={cn(
        'grid h-full w-full flex-1 place-content-center gap-4 md:gap-7',
        isVertical && isLeft && 'grid-cols-[68px_1fr] md:-ml-[96px]',
        isVertical && !isLeft && 'grid-cols-[1fr_68px] md:-mr-[96px]',
        !isVertical && position === 'top' && 'grid-rows-[68px_1fr]',
        !isVertical && position === 'bottom' && 'grid-rows-[1fr_68px]',
        'max-w-3xl xl:max-w-4xl 2xl:max-w-6xl',
        className
      )}
      style={
        {
          // Usually the ornament is the top-level container,
          // so we can use the height of the content to set the height of the ornament
          '--content-height': 'max(300px,60dvh)',
        } as React.CSSProperties
      }
    >
      {/* Ornament Tab Bar */}
      <MotionView
        material
        variants={ORNAMENT_VARIANTS}
        data-ornament="tabs"
        className="relative z-[42] self-center"
        role="tablist"
        initial="collapsed"
        whileHover="expanded"
        whileFocus="expanded"
        whileTap="whileTap"
        onMouseDown={() => setTapped(true)}
        onMouseUp={() => setTapped(false)}
      >
        <div
          className={cn(
            'flex items-start gap-2 p-2.5',
            isVertical && 'flex-col',
            !isVertical && 'flex-row',
            floating && 'shadow-2xl'
          )}
        >
          {tabs.map((tab) => (
            <Button
              className="group flex w-full items-center justify-stretch rounded-full px-[10px] before:rounded-full"
              variant={activeTab?.name === tab.name ? 'default' : 'secondary'}
              aria-label={tab.title || tab.name}
              asChild
              key={tab.name}
            >
              <Link href={tab.href} className="no-underline">
                <div
                  className="relative flex-shrink-0 [&_[data-slot='icon']]:size-6 group-hover:[&_[data-slot='icon']]:opacity-95"
                  aria-hidden="true"
                >
                  {tab.icon}
                </div>
                <motion.span className="ml-4 flex-1 overflow-hidden text-start">
                  <Text
                    size="title3"
                    className="line-clamp-1 w-fit min-w-[60px] truncate font-medium leading-[24px] opacity-60 group-hover:opacity-95"
                  >
                    {tab.title || tab.name}
                  </Text>
                </motion.span>
              </Link>
            </Button>
          ))}
        </div>
      </MotionView>
      {/* Content Area */}
      <MotionView
        data-ornament="content"
        animate={tapped ? 'whileTap' : 'initial'}
        variants={{
          initial: {
            scale: 1,
            transition: {
              type: 'spring',
              bounce: 0.1,
              duration: 0.4,
            },
          },
          whileTap: {
            scale: 0.992,
            transition: {
              type: 'spring',
              bounce: 0.1,
              duration: 0.4,
            },
          },
        }}
        className={cn(
          'relative w-full overflow-visible',
          'before:pointer-events-none before:absolute before:inset-0 before:z-[10] before:content-[""]',
          'before:rounded-[var(--view-radius,34px)] before:bg-[rgba(0,0,0,var(--overlay-opacity))]',
          // reset the overlay opacity because
          // we've handled it in the parent
          '*:[--overlay-opacity:0]',
          contentClassName
        )}
      >
        {children}
      </MotionView>
    </div>
  )
}

export { Ornament }
