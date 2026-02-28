'use client'

import { useEffect, useRef, useState } from 'react'

interface UseAudioOptions {
  src: string
  volume?: number
  loop?: boolean
  autoplay?: boolean
}

export function useAudio({ src, volume = 1, loop = false, autoplay = false }: UseAudioOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Create audio element
    const audio = new Audio(src)
    audio.volume = volume
    audio.loop = loop

    // Set up event listeners
    const handleCanPlay = () => {
      setIsLoaded(true)
      setError(null)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    const handleError = (e: Event) => {
      setError('Failed to load audio')
      console.error('Audio error:', e)
    }

    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    audioRef.current = audio

    // Cleanup
    return () => {
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.pause()
    }
  }, [src, volume, loop])

  const play = async () => {
    if (audioRef.current && isLoaded) {
      try {
        await audioRef.current.play()
      } catch (err) {
        console.error('Failed to play audio:', err)
        setError('Failed to play audio')
      }
    }
  }

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  // Autoplay on mount if enabled
  useEffect(() => {
    if (autoplay && isLoaded && audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.error('Failed to play audio:', err)
        setError('Failed to play audio')
      })
    }
  }, [autoplay, isLoaded])

  return {
    play,
    pause,
    stop,
    isPlaying,
    isLoaded,
    error,
  }
}
