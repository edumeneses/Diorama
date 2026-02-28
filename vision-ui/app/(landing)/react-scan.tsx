'use client'

import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { scan } from 'react-scan'
import { debugModeAtom } from '@/lib/atoms'

export default function ReactScan() {
  const debugMode = useAtomValue(debugModeAtom)
  useEffect(() => {
    scan({
      enabled: debugMode,
    })
  }, [debugMode])
  return null
}
