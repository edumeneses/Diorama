'use client'
import { motion, useMotionTemplate, useTransform } from 'motion/react'
import { useWindow } from '@/components/core/window'

export const AppStoreWrapper = ({ children }: { children: React.ReactNode }) => {
  const { scrollY } = useWindow()
  const backgroundOpacity = useTransform(scrollY, [0, 200], [1, 0])
  const backgroundStyle = useMotionTemplate`rgba(0,0,0,${backgroundOpacity})`
  return (
    <motion.div className="flex w-full flex-col pb-12" style={{ background: backgroundStyle }}>
      {children}
    </motion.div>
  )
}
