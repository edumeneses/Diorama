'use client'
import { IconBrandGithub } from '@tabler/icons-react'
import { Ellipsis } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/core/dropdown-menu'

export const HeroDropdownMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="backdrop-blur-xl" size="icon">
        <Ellipsis data-slot="icon" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* <DropdownMenuSeparator /> */}
        <a
          href="https://github.com/fluid-design-io/vision-ui"
          target="_blank"
          rel="noopener noreferrer"
        >
          <DropdownMenuItem asChild>
            <div className="flex w-full items-center justify-between">
              Github
              <IconBrandGithub data-slot="icon" />
            </div>
          </DropdownMenuItem>
        </a>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
