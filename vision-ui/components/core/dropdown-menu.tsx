'use client'

import type { DropdownMenuContentProps, DropdownMenuProps } from '@radix-ui/react-dropdown-menu'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { AnimatePresence } from 'motion/react'
import type React from 'react'
import { createContext, useContext, useState } from 'react'

import { cn } from '@/lib/utils'
import { Button, type ButtonProps } from './button'
import { MotionView } from './view'

const DropdownMenuContext = createContext<{
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  isMouseDown: boolean
  setIsMouseDown: React.Dispatch<React.SetStateAction<boolean>>
}>({
  isOpen: false,
  setIsOpen: () => {},
  isMouseDown: false,
  setIsMouseDown: () => {},
})

export function useDropdownMenu() {
  return useContext(DropdownMenuContext)
}

const DropdownMenuTrigger = ({ children, ...props }: ButtonProps) => {
  const { isOpen } = useDropdownMenu()
  return (
    <DropdownMenuPrimitive.Trigger {...props} asChild>
      <Button variant={isOpen ? 'selected' : props.variant}>{children}</Button>
    </DropdownMenuPrimitive.Trigger>
  )
}

const DropdownMenu = ({ children, ...props }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMouseDown, setIsMouseDown] = useState(false)
  return (
    <DropdownMenuContext.Provider
      value={{
        isOpen,
        setIsOpen,
        isMouseDown,
        setIsMouseDown,
      }}
    >
      <DropdownMenuPrimitive.Root open={isOpen} onOpenChange={setIsOpen} {...props}>
        {children}
      </DropdownMenuPrimitive.Root>
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuContent = ({
  children,
  ...props
}: Omit<DropdownMenuContentProps, 'asChild' | 'forceMount'>) => {
  const { isOpen, isMouseDown } = useDropdownMenu()
  return (
    <AnimatePresence>
      {isOpen && (
        <DropdownMenuPrimitive.Portal forceMount>
          <DropdownMenuPrimitive.Content forceMount asChild data-vision-os-ui {...props}>
            <MotionView
              material
              key="dropdown-menu-content"
              className="flex min-w-[200px] flex-col gap-2 p-4"
              initial={{
                opacity: 0,
                scale: 0.65,
                y: props.side === 'top' ? 30 : -30,
              }}
              animate={{
                opacity: 1,
                scale: isMouseDown ? 0.95 : 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.65,
                y: props.side === 'top' ? 30 : -30,
              }}
              transition={{
                type: 'spring',
                stiffness: 250,
                damping: 22,
              }}
            >
              {children}
            </MotionView>
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      )}
    </AnimatePresence>
  )
}

const DropdownMenuItem = ({
  inset,
  className,
  children,
  variant,
  onMouseDown,
  onMouseUp,
  ...props
}: Omit<DropdownMenuPrimitive.DropdownMenuItemProps, 'asChild'> & {
  inset?: boolean
  variant?: 'secondary' | 'destructive'
}) => {
  const { setIsMouseDown, setIsOpen } = useDropdownMenu()
  return (
    <DropdownMenuPrimitive.Item
      onMouseDown={(e) => {
        setIsMouseDown(true)
        onMouseDown?.(e)
      }}
      onMouseUp={(e) => {
        setIsMouseDown(false)
        onMouseUp?.(e)
      }}
      onSelect={(e) => {
        e.preventDefault()
        setTimeout(() => {
          setIsOpen(false)
        }, 300)
      }}
      {...props}
      asChild
    >
      <Button
        variant={variant ?? 'secondary'}
        size="default"
        className={cn(
          //TODO: hover causing focus-visiable to trigger
          'focus-visible:ring-0 focus-visible:ring-offset-0',
          'w-full justify-start rounded-[16px] before:rounded-[16px]',
          'flex justify-between gap-2',
          "[&_[data-slot='icon']]:ml-2",
          inset && 'pl-8',
          className
        )}
        disabled={props?.disabled}
      >
        {children}
      </Button>
    </DropdownMenuPrimitive.Item>
  )
}

export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger }
