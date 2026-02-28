'use client'

import Image from 'next/image'
import { useState } from 'react'
import forest from '@/public/assets/demo/forest.avif'
import { Button } from '../../../components/core/button'
import { AspectRatio } from '../../../components/ui/aspect-ratio'
import { Text } from '../../../components/ui/typography'

import img1 from './unsplash/aaron-burden-unsplash.avif'
import img2 from './unsplash/aaron-burden-unsplash-2.avif'
import img3 from './unsplash/clement-m-unsplash.avif'
import img4 from './unsplash/damiano-baschiera-unsplash.avif'
import img5 from './unsplash/dominik-schroder-unsplash.avif'
import img6 from './unsplash/kenrick-mills-unsplash.avif'
import img7 from './unsplash/matthew-smith-unsplash.avif'
import img10 from './unsplash/michael-olsen-unsplash.avif'
import img8 from './unsplash/shifaaz-shamoon-unsplash.avif'
import img9 from './unsplash/wil-stewart-unsplash.avif'

const memories = [
  {
    alt: 'Photo by Aaron Burden on Unsplash',
    src: img1,
  },
  {
    alt: 'Photo by Aaron Burden on Unsplash',
    src: img2,
  },
  {
    alt: 'Photo by Clement M on Unsplash',
    src: img3,
  },
  {
    alt: 'Photo by Damiano Baschiera on Unsplash',
    src: img4,
  },
  {
    alt: 'Photo by Dominik Schroder on Unsplash',
    src: img5,
  },
  {
    alt: 'Photo by Kenrick Mills on Unsplash',
    src: img6,
  },
  {
    alt: 'Photo by Matthew Smith on Unsplash',
    src: img7,
  },
  {
    alt: 'Photo by Shifaaz Shamoon on Unsplash',
    src: img8,
  },
  {
    alt: 'Photo by Wil Stewart on Unsplash',
    src: img9,
  },
  {
    alt: 'Photo by Michael Olsen on Unsplash',
    src: img10,
  },
]

const MemoriesView = () => {
  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 mx-auto flex items-center justify-center">
          <Text
            variant="default"
            size="XLTitle1"
            className="[text-shadow:0_0_10px_hsl(var(--background)/0.1)]"
            asChild
          >
            <h1>Vision UI</h1>
          </Text>
        </div>
        <Image
          src={forest}
          alt={'A small boat of fisherman in Fuvahmulah, Maldives heading out for the days work.'}
          className="h-[25vw] w-full object-cover"
        />
      </div>
      <div className="mb-36 grid grid-cols-5">
        {memories.map((memory, index) => (
          <AspectRatio ratio={1 / 1} key={`memory-${index}`}>
            <Image src={memory.src} alt={memory.alt} className="h-full w-full object-cover" />
          </AspectRatio>
        ))}
      </div>
    </>
  )
}

const MemoriesToolbar = () => {
  const [activeTab, setActiveTab] = useState<'year' | 'month' | 'all'>('all')
  return (
    <div>
      <Button
        variant={activeTab === 'year' ? 'default' : 'secondary'}
        onClick={() => setActiveTab('year')}
      >
        Year
      </Button>
      <Button
        variant={activeTab === 'month' ? 'default' : 'secondary'}
        onClick={() => setActiveTab('month')}
      >
        Month
      </Button>
      <Button
        variant={activeTab === 'all' ? 'default' : 'secondary'}
        onClick={() => setActiveTab('all')}
      >
        All
      </Button>
    </div>
  )
}

export { MemoriesView, MemoriesToolbar }
