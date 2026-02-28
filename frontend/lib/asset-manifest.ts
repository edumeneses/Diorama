export interface AssetEntry {
  id: string
  name: string
  file: string
  category: string
  scale?: number
}

const MODELS_BASE = '/assets/models'

let cachedManifest: AssetEntry[] | null = null

export async function fetchAssetManifest(): Promise<AssetEntry[]> {
  if (cachedManifest) return cachedManifest
  const res = await fetch(`${MODELS_BASE}/manifest.json`)
  if (!res.ok) throw new Error('Failed to load asset manifest')
  cachedManifest = (await res.json()) as AssetEntry[]
  return cachedManifest
}

export function getModelUrl(entry: AssetEntry): string {
  return `${MODELS_BASE}/${entry.file}`
}

export const ASSET_CATEGORIES: Record<string, string> = {
  people: 'People',
  animals: 'Animals',
  vehicles: 'Vehicles',
  props: 'Props',
  nature: 'Nature',
}
