'use client'

import {
  ScrollArea,
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from '@/components/core/scrollview'
import { Text } from '@/components/core/text'

export function ScrollViewExample() {
  const items = Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`)

  return (
    <div className="space-y-8 p-8">
      <div>
        <Text size="largeTitle" className="mb-4">
          ScrollArea Examples
        </Text>

        {/* Basic ScrollArea */}
        <div className="mb-6">
          <Text size="headline" className="mb-2">
            Basic ScrollArea
          </Text>
          <ScrollArea className="h-[200px] w-[300px] rounded-lg border border-gray-200">
            <div className="space-y-2 p-4">
              {items.map((item) => (
                <div key={item} className="rounded bg-gray-100 p-2">
                  {item}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* ScrollArea with Material */}
        <div className="mb-6">
          <Text size="headline" className="mb-2">
            ScrollArea with Material
          </Text>
          <ScrollArea className="h-[200px] w-[300px]" material={{ thickness: 'normal' }}>
            <div className="space-y-2 p-4">
              {items.map((item) => (
                <div key={item} className="rounded bg-white/10 p-2">
                  {item}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Custom ScrollArea with individual parts */}
        <div className="mb-6">
          <Text size="headline" className="mb-2">
            Custom ScrollArea Parts
          </Text>
          <ScrollAreaRoot className="h-[200px] w-[300px] rounded-lg border border-gray-200">
            <ScrollAreaViewport className="p-4">
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item} className="rounded bg-gray-100 p-2">
                    {item}
                  </div>
                ))}
              </div>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar>
              <ScrollAreaThumb />
            </ScrollAreaScrollbar>
          </ScrollAreaRoot>
        </div>

        {/* Horizontal ScrollArea */}
        <div className="mb-6">
          <Text size="headline" className="mb-2">
            Horizontal ScrollArea
          </Text>
          <ScrollArea className="h-[100px] w-[300px] rounded-lg border border-gray-200">
            <div className="flex space-x-4 p-4" style={{ width: 'max-content' }}>
              {items.map((item) => (
                <div key={item} className="whitespace-nowrap rounded bg-gray-100 p-2">
                  {item}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* ScrollArea without scrollbar */}
        <div className="mb-6">
          <Text size="headline" className="mb-2">
            ScrollArea without Scrollbar
          </Text>
          <ScrollArea
            className="h-[200px] w-[300px] rounded-lg border border-gray-200"
            showScrollbar={false}
          >
            <div className="space-y-2 p-4">
              {items.map((item) => (
                <div key={item} className="rounded bg-gray-100 p-2">
                  {item}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
