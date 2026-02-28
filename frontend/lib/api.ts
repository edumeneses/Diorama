const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
const SUPERSPLAT_URL =
  process.env.NEXT_PUBLIC_SUPERSPLAT_URL || '/supersplat/index.html'

export async function checkHealth() {
  const res = await fetch(`${BACKEND_URL}/api/health`)
  if (!res.ok) throw new Error('Backend unreachable')
  return res.json() as Promise<{
    status: string
    cuda_available: boolean
    model_loaded: boolean
  }>
}

export async function generateWorld(
  imageFile: File,
  options?: { renderVideo?: boolean; trajectoryType?: string },
) {
  const formData = new FormData()
  formData.append('image', imageFile)

  const params = new URLSearchParams()
  if (options?.renderVideo) params.set('render_video', 'true')
  if (options?.trajectoryType)
    params.set('trajectory_type', options.trajectoryType)

  const url = `${BACKEND_URL}/api/generate${params.toString() ? `?${params}` : ''}`
  const res = await fetch(url, { method: 'POST', body: formData })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || 'Generation failed')
  }

  return res.json() as Promise<{
    id: string
    ply_url: string
    ply_filename: string
    video_url: string | null
    thumbnail_url: string | null
  }>
}

export async function fetchGallery() {
  const res = await fetch(`${BACKEND_URL}/api/gallery`)
  if (!res.ok) throw new Error('Failed to fetch gallery')
  return res.json() as Promise<{
    items: Array<{
      id: string
      ply_url: string
      ply_filename: string
      created_at: number
      thumbnail_url: string | null
      video_url: string | null
    }>
  }>
}

export async function fetchWorlds() {
  const res = await fetch(`${BACKEND_URL}/api/worlds`)
  if (!res.ok) throw new Error('Failed to fetch worlds')
  return res.json() as Promise<{
    items: Array<{
      id: string
      ply_url: string
      video_url: string
      thumbnail_url: string | null
      created_at: number
    }>
  }>
}

export async function generateImageFromText(prompt: string) {
  const res = await fetch('/api/imagine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Image generation failed')
  }

  return res.json() as Promise<{ image_url: string }>
}

export async function extractImageFromUrl(url: string) {
  const res = await fetch('/api/url-to-world', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'URL extraction failed')
  }

  return res.json() as Promise<{ image_url: string }>
}

export function getSuperSplatViewerUrl(plyUrl: string): string {
  return `${SUPERSPLAT_URL}/?load=${encodeURIComponent(plyUrl)}`
}
