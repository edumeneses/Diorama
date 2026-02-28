'use client'

import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import { Text } from '@/components/core'
import type { ListRenderItemInfo } from '@/components/core/grid-layout'

export interface WorldItem {
  id: string
  plyUrl: string
  videoUrl: string
  thumbnailUrl: string | null
  createdAt: number
}

interface WorldCellProps {
  item: WorldItem
  onOpen: () => void
}

export function WorldCell({ item, onOpen }: WorldCellProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLongHover, setIsLongHover] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    videoRef.current?.play()
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => setIsLongHover(true), 1200)
  }

  const handleMouseLeave = () => {
    const v = videoRef.current
    if (v) { v.pause(); v.currentTime = 0 }
    if (hoverTimeoutRef.current) { clearTimeout(hoverTimeoutRef.current); hoverTimeoutRef.current = null }
    setIsLongHover(false)
  }

  const label = new Date(item.createdAt * 1000).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div
      onClick={onOpen}
      className="flex w-[420px] flex-col items-center justify-center gap-2 cursor-pointer"
    >
      <motion.div
        className="relative flex items-center justify-center overflow-hidden rounded-full bg-neutral-900/70 group/cell"
        whileHover={{ scale: 1.05, transition: { type: 'spring', duration: 2 } }}
        transition={{ type: 'spring', duration: 0.35 }}
        style={{ width: isLongHover ? 420 : 200, height: 200 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <video
          ref={videoRef}
          src={item.videoUrl}
          muted
          loop
          playsInline
          className="pointer-events-none absolute inset-0 size-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 z-10 bg-white/10 opacity-0 transition-opacity duration-300 bg-blend-overlay group-hover/cell:opacity-100" />
      </motion.div>
      <Text variant="secondary" size="caption1">
        {label}
      </Text>
    </div>
  )
}

export function makeRenderCell(onOpen: (item: WorldItem) => void) {
  return ({ item }: ListRenderItemInfo<WorldItem>) => (
    <WorldCell item={item} onOpen={() => onOpen(item)} />
  )
}