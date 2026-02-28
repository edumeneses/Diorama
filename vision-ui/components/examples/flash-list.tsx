'use client'

import { IconChevronRight } from '@tabler/icons-react'
import Link from 'next/link'
import { FlashList, type FlashListRenderItem } from '@/components/core'
import { Text } from '@/components/core/text'

const data = Array.from({ length: 24 }).map((_, i) => ({
  id: String(i),
  title: `Item ${i + 1}`,
}))

export default function DemoFlashlist() {
  const renderItem: FlashListRenderItem<{ id: string; title: string }> = ({ item }) => (
    <Link
      href={`#item-${item.id}`}
      className="mb-4 flex justify-between rounded-lg bg-white/10 px-3 py-2 *:pointer-events-none"
    >
      <Text>{item.title}</Text>
      <IconChevronRight className="size-4" />
    </Link>
  )
  return (
    <FlashList
      data={data ?? []}
      onEndReached={() => {
        console.log('onEndReached')
      }}
      ListHeaderComponent={<Text>Header</Text>}
      ListFooterComponent={<Text>Footer</Text>}
      className="px-6"
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  )
}
