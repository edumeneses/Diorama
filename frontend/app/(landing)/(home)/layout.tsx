import { Ornament, type OrnamentTabProps } from '@/components/core/ornament'
import { AppStoreIcon, EnvironmentsIcon } from '@/components/icons'

const tabs: OrnamentTabProps[] = [
  { name: 'Home', href: '/', icon: <AppStoreIcon className="size-6" data-slot="icon" /> },
  {
    name: 'Environments',
    href: '/environments',
    icon: <EnvironmentsIcon className="size-6" data-slot="icon" />,
  },
]

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <Ornament tabs={tabs}>{children}</Ornament>
}
