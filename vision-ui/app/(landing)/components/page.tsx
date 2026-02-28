import { Text, View } from '@/components/core'
import { Stack } from '@/components/core/stack'

export default function HomePage() {
  return (
    <Stack options={{ title: 'Home' }} className="p-6">
      <View>
        <Text variant="secondary">Browse Components</Text>
      </View>
    </Stack>
  )
}
