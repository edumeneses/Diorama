import { atom } from 'jotai'

export interface GenerationJob {
  id: string
  status: 'imagining' | 'uploading' | 'processing' | 'completed' | 'error'
  imagePreviewUrl?: string
  plyUrl?: string
  videoUrl?: string
  plyFilename?: string
  error?: string
  sourceUrl?: string
  createdAt: number
}

export interface GalleryItem {
  id: string
  plyUrl: string
  plyFilename: string
  createdAt: number
  thumbnailUrl: string | null
}

export interface PlacedModel {
  id: string
  assetId: string
  name: string
  glbUrl: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

export const currentJobAtom = atom<GenerationJob | null>(null)
export const galleryItemsAtom = atom<GalleryItem[]>([])
export const placedModelsAtom = atom<PlacedModel[]>([])
export const selectedModelIdAtom = atom<string | null>(null)
