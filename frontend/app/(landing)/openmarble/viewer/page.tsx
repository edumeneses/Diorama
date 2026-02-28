'use client'

import { Suspense, useCallback, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Stack } from '@/components/core/stack'
import { Button } from '@/components/core/button'
import { Text } from '@/components/core/text'
import { ActivityIndicator } from '@/components/activity-indicator'
import {
  SceneViewer,
  type SceneViewerHandle,
} from '@/components/marble/scene-viewer'
import { AssetPanel } from '@/components/marble/asset-panel'

function ViewerContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const plyUrl = searchParams.get('ply')
  const viewerRef = useRef<SceneViewerHandle>(null)
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)

  const handleAddAsset = useCallback(
    (url: string, name: string, defaultScale?: number) => {
      viewerRef.current?.addModel(url, name, defaultScale)
    },
    [],
  )

  const handleRemoveSelected = useCallback(() => {
    viewerRef.current?.removeSelected()
    setSelectedModelId(null)
  }, [])

  if (!plyUrl) {
    return (
      <Stack material options={{ title: 'Viewer', headerShown: true }}>
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <Text size="title3" variant="secondary">
            No world selected
          </Text>
          <Button
            variant="primary"
            className="rounded-full px-6"
            onClick={() => router.push('/openmarble')}
          >
            Create World
          </Button>
        </div>
      </Stack>
    )
  }

  return (
    <Stack
      material
      options={{
        title: 'World Viewer',
        headerShown: true,
        headerLeft: (
          <Button
            variant="secondary"
            className="rounded-full"
            onClick={() => router.back()}
          >
            Back
          </Button>
        ),
        headerRight: (
          <Button variant="secondary" className="rounded-full" asChild>
            <a href={plyUrl} download>
              Download
            </a>
          </Button>
        ),
      }}
    >
      <div className="flex h-full overflow-hidden rounded-b-[var(--view-radius)]">
        <SceneViewer
          ref={viewerRef}
          plyUrl={plyUrl}
          className="flex-1"
          onSelectModel={setSelectedModelId}
        />
        <AssetPanel
          onAddAsset={handleAddAsset}
          selectedModelId={selectedModelId}
          onRemoveSelected={handleRemoveSelected}
        />
      </div>
    </Stack>
  )
}

export default function ViewerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <ActivityIndicator className="size-8 animate-spin text-white" />
        </div>
      }
    >
      <ViewerContent />
    </Suspense>
  )
}
