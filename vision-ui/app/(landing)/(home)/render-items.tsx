import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { Text } from '@/components/core'
import type { ListRenderItemInfo } from '@/components/core/grid-layout'
import { cn } from '@/lib/utils'
import appStoreIcon from '@/public/assets/landing/home/icon-app-store.avif'
import docsIcon from '@/public/assets/landing/home/icon-docs.avif'
import fumadocsIcon from '@/public/assets/landing/home/icon-fumadocs.avif'
import githubIcon from '@/public/assets/landing/home/icon-github.avif'
import photosIcon from '@/public/assets/landing/home/icon-photos.avif'
import settingsIcon from '@/public/assets/landing/home/icon-settings.avif'

const honeycombIconClassName = cn(
  'pointer-events-none touch-none object-contain p-3 transition-all duration-300',
  'group-hover/cell:!translate-y-[var(--col-offset,-1px)] group-hover/cell:!translate-x-[var(--row-offset,-1px)] translate-x-0 translate-y-0',
  'group-focus-visible/cell:!translate-y-[var(--col-offset,-1px)] group-focus-visible/cell:!translate-x-[var(--row-offset,-1px)]',
  '[filter:drop-shadow(0px_0px_1px_rgba(12,12,12,0))] group-hover/cell:[filter:drop-shadow(calc(var(--row-offset,-1px)*-1.5)_calc(var(--col-offset,-1px)*-1.5)_1px_rgba(0,0,0,0.38))]',
  'group-focus-visible/cell:[filter:drop-shadow(calc(var(--row-offset,-1px)*-1.5)_calc(var(--col-offset,-1px)*-1.5)_1px_rgba(0,0,0,0.38))]'
)

interface ItemProps {
  id: string
  label: string
  icon: React.ReactNode
  background: React.ReactNode
  href?: string
}

export const items: ItemProps[] = [
  {
    id: 'settings',
    label: 'Settings',
    background: <div className="h-full w-full bg-[#2E2E2F]"></div>,
    icon: <Image src={settingsIcon} alt="Settings" className={honeycombIconClassName} />,
    href: '/components',
  },
  {
    id: 'app-store',
    label: 'App Store',
    icon: <Image src={appStoreIcon} alt="App Store" className={honeycombIconClassName} />,
    background: <div className="h-full w-full bg-gradient-to-t from-blue-600 to-sky-400"></div>,
    href: '#app-store', // TODO: add back the page
  },
  {
    id: 'photos',
    label: 'Photos',
    icon: <Image src={photosIcon} alt="Photos" className={honeycombIconClassName} />,
    background: <div className="h-full w-full bg-white"></div>,
    href: '#photos', // TODO: add back the page
  },
  {
    id: 'github',
    label: 'Source Code',
    icon: <Image src={githubIcon} alt="Github" className={honeycombIconClassName} />,
    background: <div className="h-full w-full bg-gradient-to-t from-[#060606] to-[#333b40]"></div>,
    href: 'https://github.com/fluid-design-io/vision-ui',
  },
  {
    id: 'docs',
    label: 'API Docs',
    icon: <Image src={docsIcon} alt="Docs" className={honeycombIconClassName} />,
    background: <div className="h-full w-full bg-gradient-to-t from-[#FCC804] to-[#FFAC04]"></div>,
    href: '/docs',
  },
  {
    id: 'fumadocs',
    label: 'Fumadocs',
    icon: <Image src={fumadocsIcon} alt="Fumadocs" className={honeycombIconClassName} />,
    background: <div className="h-full w-full bg-gradient-to-t from-[#5A5962] to-[#151515]"></div>,
    href: 'https://fumadocs.vercel.app/',
  },
]

const rowIndexClassName = {
  '0': '[--col-offset:-2px]',
  '1': '[--col-offset:-1px]',
  '2': '[--col-offset:2px]',
}

const colIndexClassName = {
  '0': '[--row-offset:-1.75px]',
  '1': '[--row-offset:-0.75px]',
  '2': '[--row-offset:0px]',
  '3': '[--row-offset:1.25px]',
  '4': '[--row-offset:1.75px]',
}

export const renderCell = ({ item, rowIndex, colIndex }: ListRenderItemInfo<ItemProps>) => (
  <Link href={item.href ?? ''} className="flex flex-col items-center justify-center gap-2">
    <motion.div
      //! This causes firefox to not render the cell properly
      // material={{ thickness: 'thin' }}
      className={cn(
        'relative flex size-[100px] items-center justify-center overflow-hidden rounded-full bg-neutral-900/70 duration-300 [--view-diameter:100px] [--view-radius:50px]',
        'group/cell',
        rowIndexClassName[rowIndex.toString() as keyof typeof rowIndexClassName],
        colIndexClassName[colIndex.toString() as keyof typeof colIndexClassName]
      )}
      whileHover={{
        scale: 1.05,
        transition: {
          type: 'spring',
          duration: 2,
        },
      }}
      transition={{
        type: 'spring',
        duration: 0.35,
      }}
    >
      <div className={'pointer-events-none absolute inset-0'}>
        {item.background}
        <div
          className={cn(
            'absolute inset-0 z-10 bg-white/10 opacity-0 transition-opacity duration-300',
            'bg-blend-overlay',
            'group-hover/cell:opacity-100'
          )}
        />
      </div>
      <div className="absolute inset-0 z-[11] transition-all duration-300">{item.icon}</div>
    </motion.div>
    <Text variant="secondary" size="caption1">
      {item.label}
    </Text>
  </Link>
)
