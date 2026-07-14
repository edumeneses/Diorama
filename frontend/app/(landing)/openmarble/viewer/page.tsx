'use client'

import { Suspense, useCallback, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Stack } from '@/components/core/stack'
import { Button } from '@/components/core/button'
import { Text } from '@/components/core/text'
import { Material } from '@/components/core/material'
import { ActivityIndicator } from '@/components/activity-indicator'
import {
  SceneViewer,
  type SceneViewerHandle,
  type TransformMode,
} from '@/components/marble/scene-viewer'
import { AssetPanel } from '@/components/marble/asset-panel'
import { cn } from '@/lib/utils'

function TransformToolbar({
  mode,
  onModeChange,
  hasSelection,
}: {
  mode: TransformMode
  onModeChange: (mode: TransformMode) => void
  hasSelection: boolean
}) {
  if (!hasSelection) return null

  const modes: { key: TransformMode; label: string; shortcut: string }[] = [
    { key: 'translate', label: 'Move', shortcut: 'W' },
    { key: 'rotate', label: 'Rotate', shortcut: 'E' },
    { key: 'scale', label: 'Scale', shortcut: 'R' },
  ]

  return (
    <Material
      thickness="thinnest"
      className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 px-2 py-1.5"
    >
      {modes.map((m) => (
        <Button
          key={m.key}
          variant={mode === m.key ? 'selected' : 'secondary'}
          className="rounded-full px-3 text-sm"
          onClick={() => onModeChange(m.key)}
        >
          <span>{m.label}</span>
          <span
            className={cn(
              'ml-1.5 text-[10px] opacity-40',
              mode === m.key && 'opacity-60',
            )}
          >
            {m.shortcut}
          </span>
        </Button>
      ))}
      <Text size="caption2" variant="tertiary" className="ml-2 px-1">
        Del to remove · Esc to deselect
      </Text>
    </Material>
  )
}

function ViewerContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const plyUrl = searchParams.get('ply')
  const viewerRef = useRef<SceneViewerHandle>(null)
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const [transformMode, setTransformMode] = useState<TransformMode>('translate')
  // 360° worlds (WorldGen) are viewed from inside; 3D photos (SHARP) from
  // outside. Initialized from the URL, switchable in the header for gallery
  // items where the engine isn't known.
  const [worldMode, setWorldMode] = useState(
    searchParams.get('mode') === 'world',
  )

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

  const handleModeChange = useCallback((mode: TransformMode) => {
    setTransformMode(mode)
    viewerRef.current?.setTransformMode(mode)
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
    <div className="grid h-full w-full grid-cols-[1fr_220px] gap-7">
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
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                className="rounded-full"
                onClick={() => setWorldMode((v) => !v)}
              >
                {worldMode ? '360° view' : 'Orbit view'}
              </Button>
              <Button variant="secondary" className="rounded-full" asChild>
                <a href={plyUrl} download>
                  Download
                </a>
              </Button>
            </div>
          ),
        }}
      >
        <div className="relative flex h-full overflow-hidden rounded-b-[var(--view-radius)]">
          <SceneViewer
            key={worldMode ? 'world' : 'photo'}
            ref={viewerRef}
            plyUrl={plyUrl}
            worldMode={worldMode}
            className="flex-1"
            onSelectModel={setSelectedModelId}
            onTransformModeChange={setTransformMode}
          />
          <TransformToolbar
            mode={transformMode}
            onModeChange={handleModeChange}
            hasSelection={selectedModelId !== null}
          />
        </div>
      </Stack>
      <AssetPanel
        onAddAsset={handleAddAsset}
        selectedModelId={selectedModelId}
        onRemoveSelected={handleRemoveSelected}
      />
    </div>
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
