'use client'

import { useEffect, useState } from 'react'
import { Material } from '@/components/core/material'
import { Button } from '@/components/core/button'
import { Text } from '@/components/core/text'
import {
  type AssetEntry,
  ASSET_CATEGORIES,
  fetchAssetManifest,
  getModelUrl,
} from '@/lib/asset-manifest'
import { cn } from '@/lib/utils'

interface AssetPanelProps {
  onAddAsset: (url: string, name: string, defaultScale?: number) => void
  selectedModelId: string | null
  onRemoveSelected: () => void
  className?: string
}

export function AssetPanel({
  onAddAsset,
  selectedModelId,
  onRemoveSelected,
  className,
}: AssetPanelProps) {
  const [assets, setAssets] = useState<AssetEntry[]>([])

  useEffect(() => {
    fetchAssetManifest().then(setAssets).catch(console.error)
  }, [])

  // Group by category
  const grouped = assets.reduce<Record<string, AssetEntry[]>>((acc, asset) => {
    const cat = asset.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(asset)
    return acc
  }, {})

  return (
    <Material
      thickness="thin"
      className={cn(
        'flex w-[200px] shrink-0 flex-col gap-1 overflow-y-auto p-3',
        className,
      )}
    >
      <Text size="headline" className="mb-2 px-1">
        Assets
      </Text>

      {selectedModelId && (
        <Button
          variant="destructive"
          className="mb-2 w-full rounded-full text-sm"
          onClick={onRemoveSelected}
        >
          Remove Selected
        </Button>
      )}

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-2">
          <Text size="caption1" variant="tertiary" className="mb-1 px-1 uppercase">
            {ASSET_CATEGORIES[category] || category}
          </Text>
          <div className="flex flex-col gap-1">
            {items.map((asset) => (
              <button
                key={asset.id}
                type="button"
                className={cn(
                  'vision-pro-ui-hoverable flex items-center gap-2 rounded-lg px-2 py-2 text-left',
                  'transition-colors hover:bg-white/10',
                )}
                onClick={() =>
                  onAddAsset(getModelUrl(asset), asset.name, asset.scale)
                }
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="size-4 text-white/50"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <Text size="callout" className="truncate">
                  {asset.name}
                </Text>
              </button>
            ))}
          </div>
        </div>
      ))}

      {assets.length === 0 && (
        <Text size="caption1" variant="tertiary" className="px-1">
          Loading assets...
        </Text>
      )}
    </Material>
  )
}
