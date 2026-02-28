'use client'

import { motion } from 'motion/react'
import type { StaticImageData } from 'next/image'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { Text } from '@/components/core'
import type { ListRenderItemInfo } from '@/components/core/grid-layout'
import data from '@/components/environment/data'
import { cn } from '@/lib/utils'
import { saveEnvironment } from '../../actions'

interface ItemProps {
  id: string
  label: string
  background: StaticImageData
}

export const items: ItemProps[] = data.map((environment) => ({
  id: environment.id,
  label: environment.label,
  background: environment.icon,
}))

export const renderCell = ({ item }: ListRenderItemInfo<ItemProps>) => {
  const [isLongHover, setIsLongHover] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }

    // Set a new timeout to trigger long hover after 1.2 seconds
    hoverTimeoutRef.current = setTimeout(() => {
      setIsLongHover(true)
    }, 1200)
  }

  const handleMouseLeave = () => {
    // Clear the timeout and reset the state
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setIsLongHover(false)
  }
  return (
    <div
      onClick={() => saveEnvironment(item.id)}
      className="flex w-[140px] flex-col items-center justify-center gap-2"
    >
      <motion.div
        //! This causes firefox to not render the cell properly
        // material={{ thickness: 'thin' }}
        className={cn(
          'relative flex items-center justify-center overflow-hidden rounded-full bg-neutral-900/70 duration-300 [--view-diameter:100px] [--view-radius:50px]',
          'group/cell'
        )}
        whileHover={{
          scale: 1.05,
          transition: {
            type: 'spring',
            duration: 2,
          },
        }}
        transition={{
          type: 'spring',
          duration: 0.35,
        }}
        style={{
          width: isLongHover ? 140 : 100,
          height: 100,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={'pointer-events-none absolute inset-0'}>
          <Image src={item.background} alt={item.label} className="size-full object-cover" />
          <div
            className={cn(
              'absolute inset-0 z-10 bg-white/10 opacity-0 transition-opacity duration-300',
              'bg-blend-overlay',
              'group-hover/cell:opacity-100'
            )}
          />
        </div>
      </motion.div>
      <Text variant="secondary" size="caption1">
        {item.label}
      </Text>
    </div>
  )
}
