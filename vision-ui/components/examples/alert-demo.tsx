'use client'

import { Alert, AlertProvider } from '@/components/core/alert'
import { Button } from '@/components/core/button'
import { Text } from '@/components/core/text'
import { View } from '@/components/core/view'

// Demo component that uses the Alert system
export function AlertDemoContent() {
  const createTwoButtonAlert = async () => {
    const result = await Alert.alert('Alert Title', 'My Alert Msg', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      { text: 'OK', onPress: () => console.log('OK Pressed') },
    ])
    console.log('Alert result:', result) // 0 for Cancel, 1 for OK
  }

  const createThreeButtonAlert = async () => {
    const result = await Alert.alert('Alert Title', 'My Alert Msg', [
      {
        text: 'Ask me later',
        onPress: () => console.log('Ask me later pressed'),
      },
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      { text: 'OK', onPress: () => console.log('OK Pressed') },
    ])
    console.log('Alert result:', result) // 0, 1, or 2 based on button pressed
  }

  const createDestructiveAlert = async () => {
    const result = await Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: () => console.log('Delete Pressed'),
        style: 'destructive',
      },
    ])
    console.log('Alert result:', result)
  }

  const createSimpleAlert = async () => {
    const result = await Alert.alert(
      'Simple Alert',
      'This is a simple alert with just an OK button',
      [{ text: 'OK', onPress: () => console.log('OK Pressed'), style: 'primary' }]
    )
    console.log('Alert result:', result) // 0 for OK
  }

  return (
    <>
      <View className="space-y-3">
        <Button onClick={createSimpleAlert} className="w-full">
          Simple Alert
        </Button>

        <Button onClick={createTwoButtonAlert} className="w-full">
          Two Button Alert
        </Button>

        <Button onClick={createThreeButtonAlert} className="w-full">
          Three Button Alert
        </Button>

        <Button onClick={createDestructiveAlert} className="w-full">
          Destructive Alert
        </Button>
      </View>

      <View className="mt-8 rounded-lg bg-white/5 p-4">
        <Text size="body" variant="secondary" className="mb-2">
          Check the browser console to see the alert results and button press logs.
        </Text>
        <Text size="caption1" variant="tertiary">
          The Alert system returns a Promise that resolves with the index of the pressed button.
        </Text>
      </View>
    </>
  )
}

// Main demo component with provider
export function AlertDemo() {
  return (
    <AlertProvider>
      <AlertDemoContent />
    </AlertProvider>
  )
}
