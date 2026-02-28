'use client'

import { AnimatePresence, motion } from 'motion/react'
import { ActivityIndicator } from '@/components/activity-indicator'
import { Material } from '@/components/core/material'
import { Text } from '@/components/core/text'
import type { GenerationJob } from '@/lib/marble-atoms'

interface ProcessingOverlayProps {
  job: GenerationJob | null
}

export function ProcessingOverlay({ job }: ProcessingOverlayProps) {
  const isActive =
    job && (job.status === 'imagining' || job.status === 'uploading' || job.status === 'processing')

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <Material
            thickness="normal"
            className="flex flex-col items-center gap-4 p-10"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            >
              <ActivityIndicator className="size-10 text-white" />
            </motion.div>
            <Text size="title3">
              {job.status === 'imagining'
                ? job.sourceUrl
                  ? 'Scanning page for best image...'
                  : 'Imagining your world...'
                : job.status === 'uploading'
                  ? 'Uploading image...'
                  : 'Generating 3D world...'}
            </Text>
            <Text size="caption1" variant="secondary">
              This may take a minute
            </Text>
          </Material>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
