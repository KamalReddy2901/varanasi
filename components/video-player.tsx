"use client"

import { useRef, useState, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react"

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
  "1.43": `Babu in 1.43:1 ratio — tallest IMAX ratio lo darshanam cheskondi. The complete frame. Rajamouli shot Varanasi taller than any Indian film before it — so the ghats reach the sky and the river swallows the earth. This is the image as he intended it. Nothing cropped. Nothing lost.`,
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
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout>()

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
  }

  // Video control handlers
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVideoClick = () => {
    togglePlayPause()
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen()
      } else {
        document.exitFullscreen()
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

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect()
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      videoRef.current.currentTime = pos * duration
      setCurrentTime(pos * duration)
    }
  }

  const handleSeekMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    handleSeek(e)
  }

  const handleSeekMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleSeek(e)
    }
  }

  const handleSeekMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }
    
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [])

  const formatTime = (time: number) => {
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
      setShowControls(false)
    }, 3000)
  }

  const handleMouseLeave = () => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current)
    }
    hideControlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="w-full flex flex-col items-center gap-8">
      {/* Video Container */}
      <div
        ref={containerRef}
        className={`relative overflow-hidden border border-[#c9a84c]/30 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          glowPulse ? "shadow-[0_0_40px_rgba(201,168,76,0.4)]" : "shadow-[0_0_20px_rgba(201,168,76,0.15)]"
        }`}
        style={{ 
          width: containerWidth || 0,
          height: containerHeight || 0,
          opacity: containerWidth ? 1 : 0
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover cursor-pointer"
          autoPlay
          loop
          muted
          playsInline
          src="/varanasi-trailer.mp4"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={handleVideoClick}
        />
        {/* Vignette overlay */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.6)]" />
        
        {/* Format name overlay - bottom right */}
        <div 
          className="absolute bottom-[48px] right-4 pointer-events-none transition-opacity duration-200"
          style={{ 
            fontFamily: 'Cinzel, serif',
            fontSize: '11px',
            letterSpacing: '0.2em',
            color: 'white',
            opacity: 0.85,
            textShadow: '0 1px 4px rgba(0,0,0,0.8)'
          }}
        >
          {selectedFormat.label} · {selectedFormat.sublabel.toUpperCase()}
        </div>

        {/* Custom control bar */}
        <div 
          className="absolute bottom-0 left-0 right-0 flex items-center gap-3 px-4 py-2.5 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.75))',
            opacity: showControls ? 1 : 0
          }}
          onMouseMove={handleMouseMove}
        >
          {/* Play/Pause button */}
          <button
            onClick={togglePlayPause}
            className="text-[#c9a84c] hover:text-[#d4b55c] transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          {/* Current time */}
          <span className="text-[#c9a84c] text-xs font-mono min-w-[40px]">
            {formatTime(currentTime)}
          </span>

          {/* Seek bar */}
          <div 
            className="flex-grow h-1 rounded-full cursor-pointer group relative"
            style={{ background: 'rgba(201,168,76,0.25)' }}
            onMouseDown={handleSeekMouseDown}
            onMouseMove={handleSeekMouseMove}
            onMouseUp={handleSeekMouseUp}
          >
            {/* Played portion */}
            <div 
              className="h-full rounded-full bg-[#c9a84c] pointer-events-none"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            {/* Scrubber thumb */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#c9a84c] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ left: `${(currentTime / duration) * 100}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>

          {/* Duration */}
          <span className="text-[#c9a84c] text-xs font-mono min-w-[40px]">
            {formatTime(duration)}
          </span>

          {/* Mute/Unmute button */}
          <button
            onClick={toggleMute}
            className="text-[#c9a84c] hover:text-[#d4b55c] transition-colors"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="text-[#c9a84c] hover:text-[#d4b55c] transition-colors"
            aria-label="Fullscreen"
          >
            <Maximize size={18} />
          </button>
        </div>
      </div>

      {/* Format Buttons */}
      <div className="flex flex-wrap justify-center gap-3 px-4 max-w-[1200px]">
        {formats.map((format) => (
          <button
            key={format.id}
            onClick={() => handleFormatChange(format)}
            className={`px-4 py-2.5 font-serif text-xs tracking-[0.15em] uppercase transition-all duration-200 ease-out border ${
              selectedFormat.id === format.id
                ? "bg-[#c9a84c] text-[#0a0806] border-[#c9a84c]"
                : "bg-transparent text-[#c9a84c] border-[#c9a84c]/50 hover:shadow-[0_0_15px_rgba(201,168,76,0.3)]"
            }`}
          >
            {format.label} · {format.sublabel}
          </button>
        ))}
      </div>

      {/* Format Description */}
      <div 
        key={descriptionKey}
        className="max-w-[600px] px-6 text-center animate-in fade-in duration-300"
      >
        <p className="text-[#e8e0d0] font-serif italic text-sm leading-relaxed">
          {formatDescriptions[selectedFormat.id]}
        </p>
      </div>
    </div>
  )
}
