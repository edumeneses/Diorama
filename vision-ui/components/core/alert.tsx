'use client'

import { IconAlertCircle } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertDialog } from 'radix-ui'
import type React from 'react'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Button } from './button'
import { Text } from './text'
import { MotionView, View } from './view'

// Types for Alert API
export interface AlertButton {
  text: string
  onPress?: () => void
  style?: 'default' | 'primary' | 'cancel' | 'destructive'
}

export interface AlertOptions {
  title?: string
  message?: string
  buttons?: AlertButton[]
}

// Alert Context
interface AlertContextType {
  alert: (title: string, message?: string, buttons?: AlertButton[]) => Promise<number>
}

const AlertContext = createContext<AlertContextType | null>(null)

const getButtonVariant = (style?: AlertButton['style']) => {
  switch (style) {
    case 'destructive':
      return 'destructive'
    case 'primary':
      return 'primary'
    case 'cancel':
      return 'secondary'
    default:
      return 'default'
  }
}

// Alert Provider Component
export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<
    Array<AlertOptions & { id: number; resolve: (value: number) => void }>
  >([])

  const alert = useCallback((title: string, message?: string, buttons?: AlertButton[]) => {
    return new Promise<number>((resolve) => {
      const id = Date.now()
      setAlerts((prev) => [...prev, { id, title, message, buttons, resolve }])
    })
  }, [])

  const handleButtonPress = useCallback(
    (alertId: number, buttonIndex: number, onPress?: () => void) => {
      onPress?.()
      setAlerts((prev) => {
        const alert = prev.find((a) => a.id === alertId)
        alert?.resolve(buttonIndex)
        return prev.filter((a) => a.id !== alertId)
      })
    },
    []
  )

  useEffect(() => {
    Alert.setContext({ alert })
  }, [alert])

  return (
    <AlertContext.Provider value={{ alert }}>
      <motion.div
        // shrink the children when the alert is open
        animate={{
          scale: alerts.length > 0 ? 0.95 : 1,
          '--overlay-opacity': alerts.length > 0 ? 0.28 : 0,
        }}
        transition={{ type: 'spring', bounce: 0 }}
        className="flex w-full flex-1 items-center justify-center"
      >
        {children}
      </motion.div>
      <AnimatePresence>
        {alerts.map((alertItem) => (
          <AlertDialog.Root key={alertItem.id} open={true}>
            <AlertDialog.Portal>
              <AlertDialog.Content data-vision-os-ui>
                <MotionView
                  material
                  initial={{ opacity: 0, scale: 1.18 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.18 }}
                  transition={{ type: 'spring', bounce: 0 }}
                  className="fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 bg-white/10 p-6"
                >
                  {/* Icon */}
                  <View className="mb-4 flex items-center justify-center">
                    <View className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                      <IconAlertCircle />
                    </View>
                  </View>

                  {/* Title */}
                  {alertItem.title && (
                    <AlertDialog.Title asChild>
                      <Text size="title2" className="mb-2 text-center">
                        {alertItem.title}
                      </Text>
                    </AlertDialog.Title>
                  )}

                  {/* Message */}
                  {alertItem.message && (
                    <AlertDialog.Description asChild>
                      <Text
                        size="body"
                        variant="secondary"
                        className="mb-6 text-center leading-relaxed"
                      >
                        {alertItem.message}
                      </Text>
                    </AlertDialog.Description>
                  )}

                  {/* Buttons */}
                  <View className="space-y-3 overflow-visible">
                    {alertItem.buttons?.map((button, index) => (
                      <Button
                        key={index}
                        variant={getButtonVariant(button.style)}
                        className="w-full"
                        onClick={() => handleButtonPress(alertItem.id, index, button.onPress)}
                      >
                        {button.text}
                      </Button>
                    ))}
                  </View>
                </MotionView>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          </AlertDialog.Root>
        ))}
      </AnimatePresence>
    </AlertContext.Provider>
  )
}

// Hook to use Alert
export function useAlert() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider')
  }
  return context
}

// Static Alert API (React Native style)
export class Alert {
  private static context: AlertContextType | null = null

  static setContext(context: AlertContextType) {
    Alert.context = context
  }

  static alert(title: string, message?: string, buttons?: AlertButton[]): Promise<number> {
    if (!Alert.context) {
      throw new Error('Alert.alert must be used within an AlertProvider')
    }
    return Alert.context.alert(title, message, buttons)
  }
}
