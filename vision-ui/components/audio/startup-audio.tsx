'use client'

import { useEffect, useState } from 'react'
import { useAudio } from '@/hooks/use-audio'

interface StartupAudioProps {
  src: string
  volume?: number
  onPlay?: () => void
  onError?: (error: string) => void
}

export function StartupAudio({ src, volume = 0.5, onPlay, onError }: StartupAudioProps) {
  const [isPlayed, setIsPlayed] = useState(false)
  const { play, isLoaded, error } = useAudio({
    src,
    volume,
    autoplay: false, // We'll handle autoplay manually after user interaction
    loop: false,
  })

  // Handle errors
  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  // Play audio when component mounts and audio is loaded
  useEffect(() => {
    if (isLoaded && !isPlayed) {
      // Small delay to ensure everything is ready
      const timer = setTimeout(() => {
        play()
          .then(() => {
            setIsPlayed(true)
            if (onPlay) {
              onPlay()
            }
          })
          .catch((err) => {
            console.error('Failed to play startup audio:', err)
            if (onError) {
              onError('Failed to play startup audio')
            }
          })
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isLoaded, play, onPlay, onError, isPlayed])

  // This component doesn't render anything visible
  return null
}
