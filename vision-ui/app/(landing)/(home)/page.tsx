'use client'

import { GridList } from '@/components/core/grid-layout'
import { items, renderCell } from './render-items'

export default function GridListPage() {
  return <GridList items={items} renderCell={renderCell} />
}
