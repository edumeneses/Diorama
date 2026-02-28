'use client'

import { animate, type MotionValue, motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

// --- TYPE DEFINITIONS ---

/**
 * Basic constraint for items passed to the layout.
 * They must have a unique 'id'.
 */
interface ItemT {
  id: string | number
}

/**
 * Information object passed to the `renderCell` function.
 */
export interface ListRenderItemInfo<T> {
  /** The item from the `items` array. */
  item: T
  /** True if the cell is currently being pressed down. */
  isTapping: boolean
  /** The row index of the cell. */
  rowIndex: number
  /** The column index of the cell. */
  colIndex: number
}

/**
 * Props for the main GridList component.
 */
interface GridListProps<T extends ItemT> {
  /** An array of data items to render. */
  items: T[]
  /**
   * A function that returns a React element to render for a given item.
   * @param info - An object containing the item, index, and interaction states.
   * @returns A React.ReactNode to display.
   */
  renderCell: (info: ListRenderItemInfo<T>) => React.ReactNode
  /**
   * The diameter of each cell in pixels.
   * @default 100
   */
  itemSize?: number
  /**
   * The space between each cell in pixels.
   * @default 48
   */
  gutter?: number
  /**
   * The vertical spacing factor between rows.
   * @default 1.4
   */
  verticalSpacing?: number
}

// --- HOOKS and HELPERS ---

const useWindowSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const updateSize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', updateSize)
    updateSize()
    return () => window.removeEventListener('resize', updateSize)
  }, [])
  return size
}

const getCellLayoutProps = (
  index: number,
  itemsPerPage: number,
  topBottomRowCols: number,
  middleRowCols: number
) => {
  const pageIndex = Math.floor(index / itemsPerPage)
  const indexInPage = index % itemsPerPage

  let rowIndex: number, colIndex: number

  if (indexInPage < topBottomRowCols) {
    // Top Row
    rowIndex = 0
    colIndex = indexInPage
  } else if (indexInPage < topBottomRowCols + middleRowCols) {
    // Middle Row
    rowIndex = 1
    colIndex = indexInPage - topBottomRowCols
  } else {
    // Bottom Row
    rowIndex = 2
    colIndex = indexInPage - topBottomRowCols - middleRowCols
  }

  return { pageIndex, rowIndex, colIndex }
}

const getAttractionEffect = (
  index: number,
  tappingIndex: number | null,
  itemsPerPage: number,
  topBottomRowCols: number,
  middleRowCols: number
) => {
  if (tappingIndex === null || index === tappingIndex) {
    return { isAffected: false, intensity: 0, shiftX: 0, shiftY: 0 }
  }

  const props = getCellLayoutProps(index, itemsPerPage, topBottomRowCols, middleRowCols)
  const tappedProps = getCellLayoutProps(
    tappingIndex,
    itemsPerPage,
    topBottomRowCols,
    middleRowCols
  )

  // Only affect cells on the same page
  if (props.pageIndex !== tappedProps.pageIndex) {
    return { isAffected: false, intensity: 0, shiftX: 0, shiftY: 0 }
  }

  // Calculate distance between cells
  const deltaX = tappedProps.colIndex - props.colIndex
  const deltaY = tappedProps.rowIndex - props.rowIndex
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

  // Maximum distance to consider (adjust this to control the effect radius)
  const maxDistance = 3
  if (distance > maxDistance || distance === 0) {
    return { isAffected: false, intensity: 0, shiftX: 0, shiftY: 0 }
  }

  // Calculate intensity based on distance (closer = stronger effect)
  const intensity = Math.max(0, 1 - distance / maxDistance)

  // Calculate shift direction and amount
  const maxShift = 10 // Maximum shift in pixels
  const shiftAmount = intensity * maxShift

  const shiftX = distance > 0 ? (deltaX / distance) * shiftAmount : 0
  const shiftY = distance > 0 ? (deltaY / distance) * shiftAmount : 0

  return { isAffected: true, intensity, shiftX, shiftY }
}

// --- COMPONENTS ---

interface PageIndicatorProps {
  pageIndex: number
  scrollX: MotionValue<number>
  pageWidth: number
}

const PageIndicator = ({ pageIndex, scrollX, pageWidth }: PageIndicatorProps) => {
  const pageProgress = useTransform(scrollX, (value) => {
    const distance = Math.abs(pageIndex + value / pageWidth)
    return Math.max(1 - distance * 0.5, 0.4)
  })
  return <motion.div className="h-2 w-2 rounded-full bg-white" style={{ opacity: pageProgress }} />
}

interface PagerCellProps<T extends ItemT> {
  item: T
  index: number
  pageIndex: number // Added to determine if it's the first page
  renderCell: (info: ListRenderItemInfo<T>) => React.ReactNode
  rowIndex: number
  colIndex: number
  itemsPerPage: number
  topBottomRowCols: number
  middleRowCols: number
  itemSize: number
  gutter: number
  verticalSpacing: number
  scrollX: MotionValue<number>
  pageWidth: number
  pageOffset: number
  tappingIndex: number | null
  setTappingIndex: (index: number | null) => void
}

const PagerCell = <T extends ItemT>({
  item,
  index,
  pageIndex,
  renderCell,
  rowIndex,
  colIndex,
  itemsPerPage,
  topBottomRowCols,
  middleRowCols,
  itemSize,
  gutter,
  verticalSpacing,
  scrollX,
  pageWidth,
  pageOffset,
  tappingIndex,
  setTappingIndex,
}: PagerCellProps<T>) => {
  const isFirstPage = pageIndex === 0
  const isTapping = tappingIndex === index
  const attractionEffect = getAttractionEffect(
    index,
    tappingIndex,
    itemsPerPage,
    topBottomRowCols,
    middleRowCols
  )

  const cellX =
    rowIndex !== 1
      ? colIndex * (itemSize + gutter) + (itemSize + gutter) / 2
      : colIndex * (itemSize + gutter)
  const cellY = rowIndex * (itemSize * verticalSpacing)

  const centerCol = Math.floor(middleRowCols / 2)
  const distance = Math.abs(rowIndex - 1) + Math.abs(colIndex - centerCol)
  const revealDelay = isFirstPage ? 0.1 + distance * 0.08 : 0

  // Calculate center position for initial animation
  const centerX = ((middleRowCols - 1) * (itemSize + gutter)) / 2
  const centerY = itemSize * verticalSpacing // Middle row Y position

  const middleRowParallax = useTransform(
    scrollX,
    [-pageOffset - pageWidth, -pageOffset, -pageOffset + pageWidth],
    [-itemSize * 1.5, 0, itemSize * 1.5]
  )

  const cellAbsoluteX = pageOffset + cellX
  const cellScreenX = useTransform(scrollX, (value) => value + cellAbsoluteX)
  const inputRange = [-itemSize, 0, pageWidth - itemSize, pageWidth]
  const scrollScale = useTransform(cellScreenX, inputRange, [0.6, 1, 1, 0.6], { clamp: true })
  const scrollOpacity = useTransform(cellScreenX, inputRange, [0, 1, 1, 0], { clamp: true })
  const scrollFilter = useTransform(
    cellScreenX,
    inputRange,
    ['blur(16px)', 'blur(0px)', 'blur(0px)', 'blur(16px)'],
    { clamp: true }
  )

  return (
    <motion.div
      layout
      style={{
        position: 'absolute',
        left: cellX,
        top: cellY,
        width: itemSize,
        height: itemSize,
        x: rowIndex === 1 ? middleRowParallax : 0,
        scale: scrollScale,
        opacity: scrollOpacity,
        filter: scrollFilter,
      }}
      initial={
        isFirstPage
          ? {
              x: (centerX - cellX) * 0.5,
              y: (centerY - cellY) * 0.5,
              opacity: 0,
              scale: 0.5,
            }
          : undefined
      }
      animate={
        isFirstPage
          ? {
              x: 0,
              y: 0,
              opacity: 1,
              scale: 1,
            }
          : undefined
      }
      transition={{ type: 'spring', damping: 18, stiffness: 90, delay: revealDelay }}
      onMouseDown={() => setTappingIndex(index)}
      onMouseUp={() => setTappingIndex(null)}
      onMouseLeave={() => setTappingIndex(null)}
    >
      <motion.div
        className="h-full w-full"
        animate={{
          scale: isTapping ? 0.9 : attractionEffect.isAffected ? 0.98 : 1,
          x: attractionEffect.shiftX,
          y: attractionEffect.shiftY,
        }}
        transition={{ type: 'spring', bounce: 0 }}
      >
        {renderCell({
          item,
          rowIndex,
          colIndex,
          isTapping,
        })}
      </motion.div>
    </motion.div>
  )
}

interface PagerProps<T extends ItemT> {
  items: T[]
  pageIndex: number
  renderCell: (info: ListRenderItemInfo<T>) => React.ReactNode
  itemSize: number
  gutter: number
  verticalSpacing: number
  scrollX: MotionValue<number>
  pageWidth: number
  itemsPerPage: number
  topBottomRowCols: number
  middleRowCols: number
  tappingIndex: number | null
  setTappingIndex: (index: number | null) => void
}

const Pager = <T extends ItemT>(props: PagerProps<T>) => {
  const { items, pageIndex, itemsPerPage, topBottomRowCols, middleRowCols } = props
  const pageOffset = pageIndex * props.pageWidth

  return (
    <div className="absolute top-0 h-full" style={{ left: pageOffset, width: props.pageWidth }}>
      {items.map((item, i) => {
        const overallIndex = pageIndex * itemsPerPage + i
        const { rowIndex, colIndex } = getCellLayoutProps(
          overallIndex,
          itemsPerPage,
          topBottomRowCols,
          middleRowCols
        )

        return (
          <PagerCell
            key={item.id}
            {...{
              ...props,
              item,
              index: overallIndex,
              pageIndex,
              rowIndex,
              colIndex,
              pageOffset,
            }}
          />
        )
      })}
    </div>
  )
}

export const GridList = <T extends ItemT>({
  items,
  renderCell,
  itemSize = 100,
  gutter = 48,
  verticalSpacing = 1.4,
}: GridListProps<T>) => {
  const { width } = useWindowSize()
  const scrollX = useMotionValue(0)
  const [tappingIndex, setTappingIndex] = useState<number | null>(null)
  const [isLayoutReady, setIsLayoutReady] = useState(false)

  const middleRowCols =
    width > 0 ? Math.max(3, Math.min(Math.floor((width * 0.8) / (itemSize + gutter)), 5)) : 3
  const topBottomRowCols = middleRowCols - 1
  const itemsPerPage = topBottomRowCols + middleRowCols + topBottomRowCols

  const pageWidth = middleRowCols * (itemSize + gutter) - gutter
  const totalHeight = itemSize * 2 * verticalSpacing + itemSize

  useEffect(() => {
    if (width > 0) {
      setIsLayoutReady(true)
    }
  }, [width])

  const pages: T[][] = []
  for (let i = 0; i < items.length; i += itemsPerPage) {
    pages.push(items.slice(i, i + itemsPerPage))
  }

  const onDragEnd = (event: any, info: { velocity: { x: number } }) => {
    const velocity = info.velocity.x
    const currentPage = -scrollX.get() / pageWidth
    let targetPage =
      Math.abs(velocity) > 300
        ? velocity > 0
          ? Math.floor(currentPage)
          : Math.ceil(currentPage)
        : Math.round(currentPage)

    targetPage = Math.max(0, Math.min(pages.length - 1, targetPage))
    animate(scrollX, -targetPage * pageWidth, { type: 'spring', damping: 25, stiffness: 200 })
  }

  return (
    <div
      className="relative flex h-max w-full items-center justify-center"
      onMouseUp={() => setTappingIndex(null)}
    >
      <div className="relative" style={{ width: pageWidth, height: totalHeight }}>
        <motion.div
          className="relative flex h-full"
          style={{ x: scrollX, width: pages.length * pageWidth }}
          drag="x"
          dragConstraints={{ left: -(pages.length - 1) * pageWidth, right: 0 }}
          dragTransition={{ bounceStiffness: 600, bounceDamping: 80 }}
          onDragEnd={onDragEnd}
        >
          {isLayoutReady &&
            pages.map((pageItems, i) => (
              <Pager
                key={`page-${i}`}
                pageIndex={i}
                items={pageItems}
                renderCell={renderCell}
                itemSize={itemSize}
                gutter={gutter}
                verticalSpacing={verticalSpacing}
                scrollX={scrollX}
                pageWidth={pageWidth}
                itemsPerPage={itemsPerPage}
                topBottomRowCols={topBottomRowCols}
                middleRowCols={middleRowCols}
                tappingIndex={tappingIndex}
                setTappingIndex={setTappingIndex}
              />
            ))}
        </motion.div>
      </div>
      {isLayoutReady && pages.length > 1 && (
        <div className="-translate-x-1/2 -bottom-12 absolute left-1/2 flex space-x-2">
          {pages.map((_, i) => (
            <PageIndicator key={i} pageIndex={i} scrollX={scrollX} pageWidth={pageWidth} />
          ))}
        </div>
      )}
    </div>
  )
}
