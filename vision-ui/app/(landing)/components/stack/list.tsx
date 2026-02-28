'use client'

import { IconChevronRight } from '@tabler/icons-react'
import Link from 'next/link'
import { FlashList, type FlashListRenderItem } from '@/components/core'
import { Text } from '@/components/core/text'

export default function List({ data }: { data: { id: string; title: string }[] }) {
  const renderItem: FlashListRenderItem<{ id: string; title: string }> = ({ item }) => (
    <Link
      href={`/v2-demo/${item.id}`}
      className="mb-4 flex justify-between rounded-lg bg-white/10 px-3 py-2 *:pointer-events-none"
    >
      <Text>{item.title}</Text>
      <IconChevronRight className="size-4" />
    </Link>
  )
  return (
    <FlashList
      data={data}
      onEndReached={() => {
        console.log('onEndReached')
      }}
      ListHeaderComponent={<Text>Header</Text>}
      ListFooterComponent={<Text>Footer</Text>}
      className="px-12"
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  )
}
