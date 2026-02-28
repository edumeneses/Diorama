import { Cursor } from '../core/cursor'
import { Ornament, type OrnamentTabProps } from '../core/ornament'
import { AppStoreIcon, EnvironmentsIcon, PeopleIcon } from '../icons'

const tabs: OrnamentTabProps[] = [
  { name: 'Home', href: '#', icon: <AppStoreIcon className="size-6" data-slot="icon" /> },
  {
    name: 'People',
    href: '#',
    icon: <PeopleIcon className="size-6" data-slot="icon" />,
  },
  {
    name: 'Environments',
    href: '#',
    icon: <EnvironmentsIcon className="size-6" data-slot="icon" />,
  },
]

export const OrnamentExample = () => {
  return (
    <div className="flex w-full flex-1 pl-[96px]">
      <Ornament tabs={tabs}>
        <div>Content</div>
      </Ornament>
      <Cursor />
    </div>
  )
}
