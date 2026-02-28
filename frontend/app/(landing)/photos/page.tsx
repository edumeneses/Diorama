import {
  OrnamentWindowed,
  OrnamentWindowedContent,
  OrnamentWindowedContents,
  OrnamentWindowedTab,
  OrnamentWindowedTabs,
} from '@/components/core/ornament-windowed'
import {
  PhotosIcon,
  CollectionsIcon,
  EnvironmentsIcon,
  SpacialIcon,
  PanoIcon,
} from '@/components/icons'
import { defaultWindowProps } from '../constants'
import { WorldGrid } from './memories-view'

const CATEGORIES = [
  { value: 'interior', label: 'Interior', Icon: CollectionsIcon },
  { value: 'exterior', label: 'Exterior', Icon: EnvironmentsIcon },
  { value: 'stylized', label: 'Stylized', Icon: PhotosIcon },
  // { value: 'fantasy', label: 'Fantasy', Icon: SpacialIcon },
  // { value: 'sci-fi', label: 'Sci-Fi', Icon: PanoIcon },
] as const

function GalleryPage() {
  return (
    <OrnamentWindowed defaultTab="stylized">
      <OrnamentWindowedTabs>
        {CATEGORIES.map(({ value, label, Icon }) => (
          <OrnamentWindowedTab
            key={value}
            icon={<Icon data-slot="icon" />}
            label={label}
            value={value}
          />
        ))}
      </OrnamentWindowedTabs>
      <OrnamentWindowedContents>
        {CATEGORIES.map(({ value }) => (
          <OrnamentWindowedContent key={value} value={value} {...defaultWindowProps}>
            <WorldGrid category={value} />
          </OrnamentWindowedContent>
        ))}
      </OrnamentWindowedContents>
    </OrnamentWindowed>
  )
}

export default GalleryPage
