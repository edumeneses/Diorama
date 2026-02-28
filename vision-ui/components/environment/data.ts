import type { StaticImageData } from 'next/image'
import yosemiteBackground from '@/public/assets/environments/adam-kool-yosemite-background.avif'
import yosemiteIcon from '@/public/assets/environments/adam-kool-yosemite-icon.avif'
import joshuaTreeBackground from '@/public/assets/environments/cedric-letsch-joshua-tree-background.avif'
import joshuaTreeIcon from '@/public/assets/environments/cedric-letsch-joshua-tree-icon.avif'
import homeNightBackground from '@/public/assets/environments/home-night-background.avif'
import homeNightIcon from '@/public/assets/environments/home-night-icon.avif'
import haleakalaBackground from '@/public/assets/environments/tevin-trinh-haleakala-background.avif'
import haleakalaIcon from '@/public/assets/environments/tevin-trinh-haleakala-icon.avif'

export interface Environment {
  id: string
  label: string
  icon: StaticImageData
  background: StaticImageData
  credit: { name: string; url: string }
  /**
   * @example `bg-black/10`
   */
  brightnessOffset?: string
}

const data: Environment[] = [
  {
    id: 'home-night',
    label: 'Home Night',
    icon: homeNightIcon,
    background: homeNightBackground,
    credit: {
      name: 'Apple - Figma',
      url: 'https://www.figma.com/community/file/1253443272911187215/apple-design-resources-visionos',
    },
  },
  {
    id: 'yosemite',
    label: 'Yosemite',
    icon: yosemiteIcon,
    background: yosemiteBackground,
    credit: {
      name: 'Adam Kool',
      url: 'https://unsplash.com/@adamkool',
    },
    brightnessOffset: 'bg-black/20',
  },
  {
    id: 'joshua-tree',
    label: 'Joshua Tree',
    icon: joshuaTreeIcon,
    background: joshuaTreeBackground,
    credit: {
      name: 'Cedric Letsch',
      url: 'https://unsplash.com/@cedricletsch',
    },
    brightnessOffset: 'bg-black/15',
  },
  {
    id: 'haleakala',
    label: 'Haleakala',
    icon: haleakalaIcon,
    background: haleakalaBackground,
    credit: {
      name: 'Tevin Trinh',
      url: 'https://unsplash.com/@tevintrinh',
    },
    brightnessOffset: 'bg-black/20',
  },
]

export default data
