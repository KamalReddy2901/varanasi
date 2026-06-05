"use client"

import { useRef, useState, useEffect } from "react"

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
  const [selectedFormat, setSelectedFormat] = useState<Format>(formats[0])
  const [containerHeight, setContainerHeight] = useState<number>(0)
  const [glowPulse, setGlowPulse] = useState(false)
  const [descriptionKey, setDescriptionKey] = useState(0)

  const updateHeight = () => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth
      const newHeight = width / selectedFormat.ratio
      setContainerHeight(newHeight)
    }
  }

  useEffect(() => {
    updateHeight()
    window.addEventListener("resize", updateHeight)
    return () => window.removeEventListener("resize", updateHeight)
  }, [selectedFormat])

  const handleFormatChange = (format: Format) => {
    setSelectedFormat(format)
    setGlowPulse(true)
    setDescriptionKey(prev => prev + 1)
    setTimeout(() => setGlowPulse(false), 600)
  }

  return (
    <div className="w-full flex flex-col items-center gap-8">
      {/* Video Container */}
      <div
        ref={containerRef}
        className={`relative w-[95vw] md:w-[90vw] lg:w-[85vw] max-w-[1200px] overflow-hidden border border-[#c9a84c]/30 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          glowPulse ? "shadow-[0_0_40px_rgba(201,168,76,0.4)]" : "shadow-[0_0_20px_rgba(201,168,76,0.15)]"
        }`}
        style={{ height: containerHeight || "auto" }}
      >
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          src="/varanasi-trailer.mp4"
        />
        {/* Vignette overlay */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.6)]" />
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
