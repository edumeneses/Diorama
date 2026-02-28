import { Stack } from '@/components/core/stack'
import DemoFlashlist from '@/components/examples/flash-list'

export default function HomePage() {
  return (
    <Stack options={{ title: 'Home' }}>
      <DemoFlashlist />
    </Stack>
  )
}
