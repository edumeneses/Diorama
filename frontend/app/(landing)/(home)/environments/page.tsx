'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GridList } from '@/components/core/grid-layout'
import { Text } from '@/components/core'
import { fetchWorlds } from '@/lib/api'
import { makeRenderCell, type WorldItem } from './render-items'

export default function EnvironmentsPage() {
  const router = useRouter()
  const [worlds, setWorlds] = useState<WorldItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWorlds()
      .then((data) => {
        const items = data.items.map((item) => ({
          id: item.id,
          plyUrl: item.ply_url,
          videoUrl: item.video_url,
          thumbnailUrl: item.thumbnail_url,
          createdAt: item.created_at,
        }))
        setWorlds(items)
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))
  }, [])

  const renderCell = useCallback(
    makeRenderCell((item) =>
      router.push(`/openmarble/viewer?ply=${encodeURIComponent(item.plyUrl)}`),
    ),
    [router],
  )

  if (loading) return null

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Text variant="tertiary" size="callout">
          {error}
        </Text>
      </div>
    )
  }

  if (worlds.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Text variant="tertiary" size="callout">
          No worlds generated yet
        </Text>
      </div>
    )
  }

  return <GridList items={worlds} renderCell={renderCell} itemSize={200} />
}
