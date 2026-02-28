import { Stack } from '@/components/core/stack'
import { Text } from '@/components/core/text'
import { View } from '@/components/core/view'

export default function StackPage() {
  return (
    <Stack options={{ title: 'Stack Demo' }}>
      <View className="p-6">
        <View className="mt-8 rounded-lg bg-white/5 p-4">
          <Text size="title1" className="mb-6">
            Stack Demo
          </Text>
          <Text size="body" variant="secondary" className="mb-2">
            Stack is a hierarchical navigator with header support.
          </Text>
          <Text size="caption1" variant="tertiary">
            Stack is a hierarchical navigator with header support.
          </Text>
        </View>
      </View>
    </Stack>
  )
}
