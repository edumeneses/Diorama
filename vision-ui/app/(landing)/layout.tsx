import { AlertProvider } from '@/components/core'
import { Cursor } from '@/components/core/cursor'
import Environment from '@/components/environment'

function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cursor />
      <Environment>
        <AlertProvider>{children}</AlertProvider>
      </Environment>
    </>
  )
}

export default LandingLayout
