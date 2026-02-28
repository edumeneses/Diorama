'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ButtonGroup } from '../../../components/core/button'
import { NavigationBar, NavigationBarTitle } from '../../../components/core/navigation-bar'
import { HeroDropdownMenu } from '../../../components/landing/hero-dropdown-menu'
import { Text } from '../../../components/ui/typography'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

interface World {
  /** File stem — resolves to <id>.mp4 (preview) and <id>.ply (viewer). */
  id: string
  name: string
}

const WORLDS_BY_CATEGORY: Record<string, World[]> = {
  stylized: [
    { id: '80b550e8a68b', name: 'Cozy Nature' },
    { id: '723f2013b2a9', name: 'Cartoonish Building' },
    { id: 'c7bf9e8c725c', name: 'School Classroom' },
    { id: '1d679098bc29', name: 'Cartoonish City' },
  ],
  interior: [
    { id: '81d9e8250006', name: 'Bedroom' },
    { id: '877a840c5217', name: 'Room' },
    { id: 'eb4638dfe25d', name: 'Kitchen' },
    { id: 'c04a0047b37e', name: 'Office' },
    { id: '1be058b1bbcc', name: 'Warehouse' },
  ],
  exterior: [
    { id: '25ae791ae616', name: 'HKUST Campus' },
    { id: '352803103246', name: 'Forest' },
    { id: '4fdd1050b005', name: 'Car Back Mirror' },
    { id: 'ff10d816a658', name: 'Car Front Mirror' },
  ],
  fantasy: [
    { id: '', name: 'Crystal Lagoon' },
    { id: '', name: 'Enchanted Forest' },
  ],
  'sci-fi': [
    { id: '', name: 'Orbital Station' },
    { id: '', name: 'Quantum Lab' },
  ],
}

const CATEGORY_LABELS: Record<string, string> = {
  stylized: 'Stylized',
  interior: 'Interior',
  exterior: 'Exterior',
  fantasy: 'Fantasy',
  'sci-fi': 'Sci-Fi',
}

function WorldCard({ world, onOpen }: { world: World; onOpen: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoUrl = world.id ? `${BACKEND_URL}/files/${world.id}.mp4` : null

  return (
    <button
      onClick={onOpen}
      onMouseEnter={() => videoRef.current?.play()}
      onMouseLeave={() => {
        const v = videoRef.current
        if (v) { v.pause(); v.currentTime = 0 }
      }}
      className="group relative overflow-hidden rounded-2xl bg-white/5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
    >
      <div className="relative aspect-[4/3]">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Text size="caption1" variant="tertiary">Coming soon</Text>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="truncate text-sm font-semibold text-white drop-shadow">
            {world.name}
          </p>
        </div>
      </div>
    </button>
  )
}

function WorldGrid({ category }: { category: string }) {
  const router = useRouter()
  const worlds = WORLDS_BY_CATEGORY[category] ?? []
  const label = CATEGORY_LABELS[category] ?? category

  return (
    <>
      <NavigationBar>
        <div />
        <NavigationBarTitle>{label}</NavigationBarTitle>
        <ButtonGroup>
          <HeroDropdownMenu />
        </ButtonGroup>
      </NavigationBar>

      {worlds.length === 0 ? (
        <div className="flex h-48 items-center justify-center pt-14">
          <Text variant="tertiary" size="callout">
            No worlds yet in this category
          </Text>
        </div>
      ) : (
        <div className="mb-10 grid grid-cols-2 gap-3 px-4 pb-4 pt-24">
          {worlds.map((world) => (
            <WorldCard
              key={world.id || world.name}
              world={world}
              onOpen={() =>
                router.push(
                  world.id
                    ? `/openmarble/viewer?ply=${encodeURIComponent(`${BACKEND_URL}/files/${world.id}.ply`)}`
                    : '/openmarble/viewer',
                )
              }
            />
          ))}
        </div>
      )}
    </>
  )
}

export { WorldGrid }
