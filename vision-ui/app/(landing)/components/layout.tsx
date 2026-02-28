import {
  IconBell,
  IconBolt,
  IconDots,
  IconEye,
  IconList,
  IconPalette,
  IconSettings,
  IconStack,
} from '@tabler/icons-react'
import { Text } from '@/components/core'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/core/dropdown-menu'
import { Sidebar, SidebarHeader, type SidebarItemProps } from '@/components/core/sidebar'
import { WindowControls } from '@/components/core/window-control'

const sidebarItems: SidebarItemProps[] = [
  { name: 'Overview', href: '/components', icon: <IconEye />, title: 'Overview' },
  { name: 'Stack', href: '/components/stack', icon: <IconStack />, title: 'Stack' },
  {
    name: 'Alert',
    href: '/components/alert',
    icon: <IconBell />,
    title: 'Alert',
  },
  {
    name: 'FlashList',
    href: '/components/flashlist',
    icon: <IconBolt />,
    title: 'FlashList',
  },
  {
    title: 'Section 1',
    items: [
      { name: 'Item 1', icon: <IconList />, title: 'Item 1' },
      { name: 'Item 2', icon: <IconList />, title: 'Item 2' },
    ],
  },
  {
    title: 'Section 2',
    items: [
      { name: 'Item 3', icon: <IconList />, title: 'Item 3' },
      { name: 'Item 4', icon: <IconList />, title: 'Item 4' },
    ],
  },
  {
    name: 'Settings',
    href: '/components/settings',
    icon: <IconSettings />,
    title: 'Settings',
  },
  {
    name: 'Appearance',
    href: '/components/appearance',
    icon: <IconPalette />,
    title: 'Appearance',
  },
  ...Array.from({ length: 30 }).map((_, i) => ({
    name: `Item ${i + 1}`,
    href: `#item-${i + 1}`,
    icon: <IconList />,
    title: `Item ${i + 1}`,
  })),
]

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto flex w-full flex-col items-center justify-center">
      <Sidebar
        items={sidebarItems}
        header={
          <SidebarHeader
            key="header"
            title="Header"
            headerRight={
              <DropdownMenu>
                <DropdownMenuTrigger size="icon">
                  <IconDots />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Text>Item 1</Text>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Text>Item 2</Text>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Text>Item 3</Text>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
          />
        }
        footer={<Text>Footer</Text>}
      >
        {children}
      </Sidebar>
      <WindowControls />
    </div>
  )
}
