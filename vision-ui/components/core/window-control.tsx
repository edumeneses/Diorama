'use client'

import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const WindowControls = () => {
  const { push } = useRouter()

  return (
    <motion.div
      className="group/controls absolute inset-x-0 bottom-[-37px] z-50 mx-auto inline-flex h-[37px] w-[212px] shrink-0 items-center justify-start gap-4 pt-[22px] pr-[28px] pb-px"
      layout
      layoutId="navigation-bar"
      role="toolbar"
      aria-label="Window controls"
    >
      <button
        onClick={() => push('/')}
        className={cn(
          'h-[37px] w-[37px]',
          'group/close-btn',
          'peer/close-btn',
          'flex items-center justify-center',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
          'rounded-full'
        )}
        aria-label="Close window"
        title="Go to home"
        type="button"
      >
        <span
          className={cn(
            'pointer-events-none',
            'size-3.5 rounded-[100px] bg-white/30 backdrop-blur-[20px]',
            'transition-all duration-300',
            'flex items-center justify-center',
            'group-hover/close-btn:size-6 group-hover/close-btn:bg-white/100',
            'group-active/close-btn:size-4 group-active/close-btn:bg-white/100',
            'group-focus-visible/close-btn:size-6 group-focus-visible/close-btn:bg-white/100'
          )}
        >
          <svg
            className="size-3.5 text-[#333] opacity-0 group-hover/close-btn:size-3 group-hover/close-btn:opacity-100 group-focus-visible/close-btn:size-3 group-focus-visible/close-btn:opacity-100"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </span>
      </button>
      <div
        className={cn(
          'relative h-3.5 w-[136px] rounded-[100px] bg-white/30 backdrop-blur-[20px]',
          'transition-all duration-300',
          'peer-hover/close-btn:ml-[10px] peer-hover/close-btn:w-[126px] peer-hover/close-btn:bg-white/50',
          'peer-focus-visible/close-btn:ml-[10px] peer-focus-visible/close-btn:w-[126px] peer-focus-visible/close-btn:bg-white/50'
        )}
        aria-hidden="true"
      />
    </motion.div>
  )
}

export { WindowControls }
