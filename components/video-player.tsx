"use client"

import { useRef, useState, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from "lucide-react"
import Hls from "hls.js"

interface Format {
  id: string
  label: string
  sublabel: string
  ratio: number
}

const formats: Format[] = [
  { id: "1.43", label: "1.43:1", sublabel: "IMAX", ratio: 1.43 },
  { id: "1.90", label: "1.90:1", sublabel: "IMAX Digital", ratio: 1.90 },
  { id: "2.20", label: "2.20:1", sublabel: "70mm", ratio: 2.20 },
  { id: "1.85", label: "1.85:1", sublabel: "Flat", ratio: 1.85 },
  { id: "2.39", label: "2.39:1", sublabel: "Scope", ratio: 2.39 },
]

const formatDescriptions: Record<string, string> = {
  "1.43": `Babu in 1.43:1 ratio — tallest IMAX ratio. The complete frame. Rajamouli shot Varanasi taller than any Indian film before it — so the ghats reach the sky and the river swallows the earth. This is the image as he intended it. Nothing cropped. Nothing lost.`,
  "1.90": `The IMAX digital experience — wider than the eye expects, still taller than convention allows. The scale of this Magnus Opus fills the screen from edge to edge. Most of the world will see Varanasi this way.`,
  "2.20": `The format of Lawrence of Arabia. Of Spartacus. Rajamouli always said Indian cinema deserved that legacy. In 70mm, Varanasi earns its place among the epics of cinema history.`,
  "1.85": `The standard widescreen ratio — familiar, intimate by comparison. Even constrained to this frame, Varanasi refuses to feel small. Some films are simply too large for any box.`,
  "2.39": `Ultra-wide anamorphic. The horizon stretches until Varanasi feels like the entire world — and somehow, still not wide enough to contain it.`,
}

export function VideoPlayer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [selectedFormat, setSelectedFormat] = useState<Format>(formats[0])
  const [containerHeight, setContainerHeight] = useState<number>(0)
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const [glowPulse, setGlowPulse] = useState(false)
  const [descriptionKey, setDescriptionKey] = useState(0)
  
  // Video player state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true) // Track if this is the first load
  const [showPlayButton, setShowPlayButton] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout>()
  
  // HLS and quality selection state
  const hlsRef = useRef<Hls | null>(null)
  const [qualities, setQualities] = useState<Array<{ height: number; index: number }>>([])
  const [currentQuality, setCurrentQuality] = useState<number>(-1) // -1 means auto
  const [showQualityMenu, setShowQualityMenu] = useState(false)

  const updateDimensions = () => {
    // Reserve 200px for hero section above + format buttons below (reduced from 280px for more immersive size)
    const availableHeight = window.innerHeight - 200
    const maxWidthForTallestRatio = availableHeight * 1.43
    
    // Calculate container width: min of 95vw, 1400px, and maxWidthForTallestRatio (increased from 85vw/1200px)
    const vw95 = window.innerWidth * 0.95
    const calculatedWidth = Math.min(vw95, 1400, maxWidthForTallestRatio)
    
    setContainerWidth(calculatedWidth)
    
    // Calculate height based on selected ratio
    const computedHeight = calculatedWidth / selectedFormat.ratio
    setContainerHeight(computedHeight)
  }

  useEffect(() => {
    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [selectedFormat])

  const handleFormatChange = (format: Format) => {
    setSelectedFormat(format)
    setGlowPulse(true)
    setDescriptionKey(prev => prev + 1)
    setTimeout(() => setGlowPulse(false), 600)
    // No need to touch the video - it's just a CSS change!
  }
  
  const handleQualityChange = (qualityIndex: number) => {
    if (!hlsRef.current && qualityIndex !== -1) {
      // Native HLS (Safari) - can't change quality programmatically
      console.log('Quality selection not available on this browser')
      return
    }
    
    if (hlsRef.current) {
      const hls = hlsRef.current
      
      if (qualityIndex === -1) {
        // Auto quality - enable ABR with smooth transition
        hls.nextLevel = -1
        console.log('Switching to auto quality (smooth transition)')
      } else {
        // Manual quality - use nextLevel for smooth transition
        // This will continue playing current quality while buffering the new one
        hls.nextLevel = qualityIndex
        console.log(`Switching to quality level ${qualityIndex} (${getQualityLabel(qualities[qualityIndex]?.height)}) - smooth transition`)
      }
      
      // Update UI state immediately to show selection
      setCurrentQuality(qualityIndex)
    }
    
    setShowQualityMenu(false)
  }
  
  const getQualityLabel = (height: number) => {
    switch (height) {
      case 2160: return '2160p'
      case 1080: return '1080p'
      case 720: return '720p'
      case 480: return '480p'
      default: return `${height}p`
    }
  }

  // Video control handlers
  const togglePlayPause = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause()
          setIsPlaying(false)
        } else {
          await videoRef.current.play()
          setIsPlaying(true)
          setShowPlayButton(false)
        }
      } catch (err) {
        console.log('Play/pause failed:', err)
        setShowPlayButton(true)
        setIsPlaying(false)
      }
    }
  }

  const handleVideoClick = () => {
    togglePlayPause()
  }

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (videoRef.current) {
      // iOS Safari uses webkitEnterFullscreen on the video element
      const video = videoRef.current as any
      
      if (video.webkitEnterFullscreen) {
        // iOS Safari
        video.webkitEnterFullscreen()
      } else if (containerRef.current) {
        // Standard fullscreen API for other browsers
        if (!document.fullscreenElement) {
          containerRef.current.requestFullscreen()
        } else {
          document.exitFullscreen()
        }
      }
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleLoadedData = () => {
    // Video has loaded enough data to start playing
    setIsLoading(false)
    setIsInitialLoad(false) // Mark initial load as complete
  }

  const handleCanPlay = () => {
    // Video can play through without buffering
    setIsLoading(false)
    setIsInitialLoad(false) // Mark initial load as complete
  }

  const handleWaiting = () => {
    // Video is buffering - only show loading spinner on initial load
    if (isInitialLoad) {
      setIsLoading(true)
    }
  }

  const handlePlaying = () => {
    // Video has started playing
    setIsLoading(false)
    setIsInitialLoad(false) // Mark initial load as complete
    setShowPlayButton(false)
    setIsPlaying(true)
  }

  const handlePause = () => {
    // Video was paused
    setIsPlaying(false)
  }

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoElement = e.currentTarget
    console.error('Video loading error:', videoElement.error)
    
    // Try to retry a couple times before giving up
    if (retryCount < 2) {
      console.log(`Retrying video load... (attempt ${retryCount + 1})`)
      setRetryCount(prev => prev + 1)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.load()
          videoRef.current.play().catch(() => {
            setShowPlayButton(true)
          })
        }
      }, 1000)
    } else {
      setIsLoading(false)
      setHasError(true)
    }
  }

  const handlePlay = async () => {
    if (videoRef.current) {
      try {
        // Force load before play on iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
        if (isIOS) {
          videoRef.current.load()
          await new Promise(resolve => setTimeout(resolve, 300))
        }
        
        await videoRef.current.play()
        setIsPlaying(true)
        setShowPlayButton(false)
        setHasError(false)
      } catch (err) {
        console.log('Play failed:', err)
        setShowPlayButton(true)
        setIsPlaying(false)
      }
    }
  }

  // Attempt autoplay and setup HLS
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    // HLS source URL
    const hlsSource = "https://pub-36eeef5229fc41e1bb5e30088592f214.r2.dev/hls/master.m3u8"
    
    const attemptAutoplay = async () => {
      // Check if HLS is supported
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          // Smooth quality switching settings
          abrEwmaDefaultEstimate: 500000, // Conservative starting bandwidth
          abrBandWidthFactor: 0.95, // Safety factor for quality selection
          abrBandWidthUpFactor: 0.7, // Be conservative when upgrading quality
          startLevel: -1, // Start with auto quality
          // Enable smooth quality switching without pause
          // HLS.js will buffer the new quality before switching
          capLevelToPlayerSize: false, // Allow any quality selection
          // Fragment loading settings for smooth transitions
          fragLoadingTimeOut: 20000,
          manifestLoadingTimeOut: 10000,
          levelLoadingTimeOut: 10000,
        })
        
        hlsRef.current = hls
        hls.loadSource(hlsSource)
        hls.attachMedia(videoElement)
        
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          console.log('HLS manifest loaded, levels:', data.levels)
          
          // Extract quality levels
          const qualityLevels = data.levels.map((level, index) => ({
            height: level.height,
            index: index
          }))
          setQualities(qualityLevels)
          setIsLoading(false)
          setIsInitialLoad(false) // Mark initial load as complete
          
          // Try autoplay
          videoElement.play()
            .then(() => {
              setIsPlaying(true)
              setShowPlayButton(false)
            })
            .catch((err) => {
              console.log('Autoplay blocked:', err)
              setShowPlayButton(true)
              setIsPlaying(false)
            })
        })
        
        // Track level switching for smooth quality changes
        hls.on(Hls.Events.LEVEL_SWITCHING, (event, data) => {
          console.log(`Quality switching to: ${getQualityLabel(hls.levels[data.level]?.height)} (level ${data.level})`)
        })
        
        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          console.log(`Quality switched to: ${getQualityLabel(hls.levels[data.level]?.height)} (level ${data.level})`)
          // Update UI to reflect actual current quality
          setCurrentQuality(hls.currentLevel)
        })
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS error:', data)
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, trying to recover. Details:', data.details)
                hls.startLoad()
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, trying to recover. Details:', data.details)
                hls.recoverMediaError()
                break
              default:
                console.log('Fatal error, cannot recover. Type:', data.type, 'Details:', data.details)
                setHasError(true)
                setIsLoading(false)
                break
            }
          }
        })
        
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        videoElement.src = hlsSource
        videoElement.addEventListener('loadedmetadata', () => {
          setIsLoading(false)
          // Safari doesn't expose quality levels programmatically easily
          // but we can show a simplified quality menu
          setQualities([
            { height: 2160, index: 0 },
            { height: 1080, index: 1 },
            { height: 720, index: 2 },
            { height: 480, index: 3 },
          ])
        })
        
        videoElement.play()
          .then(() => {
            setIsPlaying(true)
            setShowPlayButton(false)
          })
          .catch((err) => {
            console.log('Autoplay blocked:', err)
            setShowPlayButton(true)
            setIsPlaying(false)
          })
      } else {
        // Fallback to regular MP4 if HLS not supported
        setHasError(true)
        setIsLoading(false)
      }
    }
    
    attemptAutoplay()
    
    // Cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [])

  // Fallback: if video takes too long, hide loading after 5 seconds
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false)
      }
    }, 5000)

    return () => clearTimeout(fallbackTimer)
  }, [isLoading])

  const handleSeek = (clientX: number, element: HTMLDivElement) => {
    if (!videoRef.current) return
    
    // Force load metadata if not loaded yet
    if (!duration || duration === 0) {
      videoRef.current.load()
      // Wait for metadata to load
      const onMetadataLoaded = () => {
        if (videoRef.current && videoRef.current.duration > 0) {
          const rect = element.getBoundingClientRect()
          const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
          const newTime = pos * videoRef.current.duration
          videoRef.current.currentTime = newTime
          setCurrentTime(newTime)
          setDuration(videoRef.current.duration)
        }
        videoRef.current?.removeEventListener('loadedmetadata', onMetadataLoaded)
      }
      videoRef.current.addEventListener('loadedmetadata', onMetadataLoaded)
      return
    }
    
    const rect = element.getBoundingClientRect()
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const newTime = pos * duration
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleSeekMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setShowControls(true)
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current)
    }
    if (e.currentTarget) {
      handleSeek(e.clientX, e.currentTarget)
    }
  }

  const handleSeekTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setIsDragging(true)
    setShowControls(true)
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current)
    }
    if (e.currentTarget && e.touches[0]) {
      handleSeek(e.touches[0].clientX, e.currentTarget)
    }
  }

  const handleSeekTouchEnd = () => {
    setIsDragging(false)
    // Restart auto-hide timer after seeking
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }

  const handleSeekMouseUp = () => {
    setIsDragging(false)
    // Restart auto-hide timer after seeking
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }
    
    const handleGlobalTouchEnd = () => {
      setIsDragging(false)
    }
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && videoRef.current && duration > 0) {
        const seekBar = document.querySelector('[data-seek-bar]') as HTMLDivElement
        if (seekBar) {
          const rect = seekBar.getBoundingClientRect()
          const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
          const newTime = pos * duration
          videoRef.current.currentTime = newTime
          setCurrentTime(newTime)
        }
      }
    }

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && videoRef.current && duration > 0 && e.touches[0]) {
        e.preventDefault() // Only prevent default during active dragging
        const seekBar = document.querySelector('[data-seek-bar]') as HTMLDivElement
        if (seekBar) {
          const rect = seekBar.getBoundingClientRect()
          const pos = Math.max(0, Math.min(1, (e.touches[0].clientX - rect.left) / rect.width))
          const newTime = pos * duration
          videoRef.current.currentTime = newTime
          setCurrentTime(newTime)
        }
      }
    }
    
    if (isDragging) {
      window.addEventListener('mouseup', handleGlobalMouseUp)
      window.addEventListener('mousemove', handleGlobalMouseMove)
      window.addEventListener('touchend', handleGlobalTouchEnd)
      window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
    }
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('touchend', handleGlobalTouchEnd)
      window.removeEventListener('touchmove', handleGlobalTouchMove)
    }
  }, [isDragging, duration])

  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) {
      return '0:00'
    }
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current)
    }
    hideControlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  const handleContainerInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement
    const isControlBar = target.closest('[data-control-bar]')
    const isPlayButton = target.closest('[data-play-button]')
    const isSeekBar = target.closest('[data-seek-bar]')
    
    if (!isControlBar && !isPlayButton && !isSeekBar) {
      // If it's a touch event, show/hide controls
      if (e.type === 'touchstart') {
        setShowControls(prev => !prev)
        if (hideControlsTimeoutRef.current) {
          clearTimeout(hideControlsTimeoutRef.current)
        }
        if (isPlaying) {
          hideControlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false)
          }, 4000)
        }
      } 
      // If it's a click event (desktop), toggle play/pause
      else if (e.type === 'click') {
        togglePlayPause()
      }
    }
  }

  const handleMouseLeave = () => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current)
    }
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 1000)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keys when video player is in view and not typing in input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return
      }

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          togglePlayPause()
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (videoRef.current && duration > 0) {
            videoRef.current.currentTime = Math.max(0, currentTime - 5)
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (videoRef.current && duration > 0) {
            videoRef.current.currentTime = Math.min(duration, currentTime + 5)
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          if (videoRef.current && duration > 0) {
            videoRef.current.currentTime = Math.min(duration, currentTime + 10)
          }
          break
        case 'ArrowDown':
          e.preventDefault()
          if (videoRef.current && duration > 0) {
            videoRef.current.currentTime = Math.max(0, currentTime - 10)
          }
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
        case 'f':
          e.preventDefault()
          toggleFullscreen()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, currentTime, duration])

  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Format Buttons - Above Video */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 px-4 max-w-[1200px]">
        {formats.map((format) => (
          <button
            key={format.id}
            type="button"
            onClick={(e) => {
              handleFormatChange(format)
              e.currentTarget.blur() // Remove focus after click
            }}
            className={`px-3 md:px-4 py-2 md:py-2.5 font-serif text-[10px] md:text-xs tracking-[0.15em] uppercase transition-all duration-200 ease-out border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0806] ${
              selectedFormat.id === format.id
                ? "bg-[#c9a84c] text-[#0a0806] border-[#c9a84c]"
                : "bg-transparent text-[#c9a84c] border-[#c9a84c]/50 hover:shadow-[0_0_15px_rgba(201,168,76,0.3)]"
            }`}
          >
            {format.label} · {format.sublabel}
          </button>
        ))}
      </div>

      {/* Video Container */}
      <div
        ref={containerRef}
        className={`relative overflow-hidden border border-[#c9a84c]/30 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer ${
          glowPulse ? "shadow-[0_0_40px_rgba(201,168,76,0.4)]" : "shadow-[0_0_20px_rgba(201,168,76,0.15)]"
        }`}
        style={{ 
          width: containerWidth || 0,
          height: containerHeight || 0,
          opacity: containerWidth ? 1 : 0
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleContainerInteraction}
        onClick={handleContainerInteraction}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{
            objectPosition: 'center center'
          }}
          loop
          muted
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onLoadedData={handleLoadedData}
          onCanPlay={handleCanPlay}
          onWaiting={handleWaiting}
          onPlaying={handlePlaying}
          onPause={handlePause}
        />
        {/* Vignette overlay */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.6)]" />
        
        {/* Loading overlay */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0806]/90 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              {/* Spinner */}
              <div className="w-12 h-12 border-2 border-[#c9a84c]/20 border-t-[#c9a84c] rounded-full animate-spin" />
              {/* Loading text */}
              <p 
                className="text-[#c9a84c] italic text-sm tracking-wide"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                Your cinematic experience is loading...
              </p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0806]/95 backdrop-blur-sm z-20">
            <div className="flex flex-col items-center gap-6 px-6 text-center max-w-md">
              {/* Warning Icon */}
              <div className="w-16 h-16 border-2 border-[#c9a84c]/50 rounded-full flex items-center justify-center">
                <span className="text-[#c9a84c] text-3xl">⚠</span>
              </div>
              
              {/* Main Error Message */}
              <div className="flex flex-col gap-3">
                <h3 
                  className="text-[#c9a84c] text-base md:text-lg tracking-wide leading-relaxed"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  Video unavailable
                </h3>
                
                <p 
                  className="text-[#e8e0d0]/70 text-xs md:text-sm leading-relaxed"
                >
                  Please check your connection or try refreshing the page
                </p>
              </div>
              
              {/* Retry Button */}
              <button
                onClick={(e) => {
                  setHasError(false)
                  setIsLoading(true)
                  setRetryCount(0)
                  if (videoRef.current) {
                    videoRef.current.load()
                    videoRef.current.play().catch(() => {
                      setShowPlayButton(true)
                    })
                  }
                  e.currentTarget.blur()
                }}
                className="mt-2 px-8 py-2.5 font-serif text-[#c9a84c] text-sm tracking-[0.15em] uppercase border border-[#c9a84c] bg-transparent hover:bg-[#c9a84c] hover:text-[#0a0806] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0806]"
                type="button"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* iOS Play Button Overlay */}
        {showPlayButton && !isLoading && !hasError && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-[#0a0806]/80 backdrop-blur-sm"
            data-play-button
          >
            <button
              onClick={handlePlay}
              className="flex items-center justify-center w-20 h-20 rounded-full bg-[#c9a84c] hover:bg-[#d4b55c] transition-all duration-200 shadow-[0_0_40px_rgba(201,168,76,0.4)]"
              aria-label="Play video"
              type="button"
            >
              <Play size={32} className="text-[#0a0806] ml-1" fill="currentColor" />
            </button>
          </div>
        )}
        
        {/* Format name overlay - bottom right */}
        <div 
          className="absolute bottom-[56px] md:bottom-[48px] right-2 md:right-4 pointer-events-none transition-opacity duration-200 text-right"
          style={{ 
            fontFamily: 'Cinzel, serif',
            fontSize: '9px',
            letterSpacing: '0.2em',
            color: 'white',
            opacity: showControls ? 0 : 0.85,
            textShadow: '0 1px 4px rgba(0,0,0,0.8)'
          }}
        >
          {selectedFormat.label} · {selectedFormat.sublabel.toUpperCase()}
        </div>

        {/* Custom control bar */}
        <div 
          data-control-bar
          className="absolute bottom-0 left-0 right-0 flex items-center gap-3 px-4 py-2.5 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.75))',
            opacity: showControls ? 1 : 0,
            pointerEvents: showControls ? 'auto' : 'none'
          }}
          onMouseMove={handleMouseMove}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {/* Play/Pause button */}
          <button
            onClick={(e) => {
              togglePlayPause()
              e.currentTarget.blur()
            }}
            className="text-[#c9a84c] hover:text-[#d4b55c] transition-colors touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] rounded"
            aria-label={isPlaying ? "Pause" : "Play"}
            type="button"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          {/* Current time */}
          <span className="text-[#c9a84c] text-xs font-mono min-w-[40px]">
            {formatTime(currentTime)}
          </span>

          {/* Seek bar - larger hit area for mobile */}
          <div 
            data-seek-bar
            className="flex-grow h-8 md:h-6 flex items-center cursor-pointer group relative"
            onMouseDown={handleSeekMouseDown}
            onMouseUp={handleSeekMouseUp}
            onTouchStart={handleSeekTouchStart}
            onTouchEnd={handleSeekTouchEnd}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (e.currentTarget && !isDragging) {
                handleSeek(e.clientX, e.currentTarget)
              }
            }}
            role="slider"
            aria-label="Seek video"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            tabIndex={0}
          >
            {/* Track background */}
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-1 rounded-full" style={{ background: 'rgba(201,168,76,0.25)' }}>
                {/* Played portion */}
                <div 
                  className="h-full rounded-full bg-[#c9a84c] pointer-events-none"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
            </div>
            {/* Scrubber thumb - always visible on mobile, hover on desktop */}
            <div 
              className="absolute w-3 h-3 rounded-full bg-[#c9a84c] opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus:opacity-100 transition-opacity pointer-events-none z-10 shadow-[0_0_8px_rgba(201,168,76,0.6)]"
              style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`, transform: 'translateX(-50%)' }}
            />
          </div>

          {/* Duration */}
          <span className="text-[#c9a84c] text-xs font-mono min-w-[40px]">
            {formatTime(duration)}
          </span>

          {/* Mute/Unmute button */}
          <button
            onClick={(e) => {
              toggleMute()
              e.currentTarget.blur()
            }}
            className="text-[#c9a84c] hover:text-[#d4b55c] transition-colors touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] rounded"
            aria-label={isMuted ? "Unmute" : "Mute"}
            type="button"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Quality Settings */}
          <div className="relative flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowQualityMenu(!showQualityMenu)
                e.currentTarget.blur()
              }}
              className="text-[#c9a84c] hover:text-[#d4b55c] transition-colors touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] rounded"
              aria-label="Quality settings"
              type="button"
            >
              <Settings size={18} />
            </button>
            
            {/* Quality menu */}
            {showQualityMenu && (
              <div 
                className="absolute bottom-full right-0 mb-2 bg-[#0a0806] border border-[#c9a84c]/30 rounded shadow-lg min-w-[120px] z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="py-1">
                  <div className="px-3 py-1.5 text-[#c9a84c]/60 text-xs font-serif tracking-wider uppercase border-b border-[#c9a84c]/20">
                    Quality
                  </div>
                  
                  {/* Auto option */}
                  <button
                    onClick={() => handleQualityChange(-1)}
                    className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                      currentQuality === -1
                        ? 'text-[#c9a84c] bg-[#c9a84c]/10'
                        : 'text-[#e8e0d0] hover:bg-[#c9a84c]/5'
                    }`}
                    type="button"
                  >
                    Auto {currentQuality === -1 && '✓'}
                  </button>
                  
                  {/* Quality options */}
                  {qualities.map((quality) => (
                    <button
                      key={quality.index}
                      onClick={() => handleQualityChange(quality.index)}
                      className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                        currentQuality === quality.index
                          ? 'text-[#c9a84c] bg-[#c9a84c]/10'
                          : 'text-[#e8e0d0] hover:bg-[#c9a84c]/5'
                      }`}
                      type="button"
                    >
                      {getQualityLabel(quality.height)} {currentQuality === quality.index && '✓'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen button */}
          <button
            onClick={(e) => {
              toggleFullscreen()
              e.currentTarget.blur()
            }}
            className="text-[#c9a84c] hover:text-[#d4b55c] transition-colors touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] rounded"
            aria-label="Fullscreen"
            type="button"
          >
            <Maximize size={18} />
          </button>
        </div>
      </div>

      {/* Format Indicator and Description - grouped closer */}
      <div className="flex flex-col items-center gap-3 max-w-[600px] px-6">
        {/* Format Indicator - compact rectangular box */}
        <div 
          key={`indicator-${descriptionKey}`}
          className="animate-in fade-in duration-300"
        >
          <div className="inline-block px-3 py-0.5 border border-[#e8e0d0]/30">
            <span className="text-[#e8e0d0] font-serif text-xs tracking-[0.2em] uppercase">
              {selectedFormat.label} · {selectedFormat.sublabel}
            </span>
          </div>
        </div>

        {/* Format Description */}
        <div 
          key={descriptionKey}
          className="text-center animate-in fade-in duration-300"
        >
          <p className="text-[#e8e0d0] font-serif text-xs md:text-sm leading-loose">
            {formatDescriptions[selectedFormat.id]}
          </p>
        </div>
      </div>
    </div>
  )
}
