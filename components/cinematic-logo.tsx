"use client"

import Image from "next/image"

export function CinematicLogo() {
  return (
    <div className="relative w-[85vw] max-w-[550px] mb-8">
      {/* Hero background glow layers (behind logo only) */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[260%] w-[160%] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 45%, rgba(180, 120, 20, 0.35) 0%, rgba(120, 70, 10, 0.15) 40%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[300%] w-[200%] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 40%, rgba(201, 140, 30, 0.08) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[300%] w-[200%] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 50%, rgba(0,0,0,0.7) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Logo image — screen blend removes the black PNG background, drop-shadow gives an inner warm glow */}
      <Image
        src="/varanasi-logo.png"
        alt="Varanasi - SS Rajamouli's"
        width={550}
        height={220}
        className="relative w-full h-auto"
        style={{
          mixBlendMode: "screen",
          filter:
            "invert(1) sepia(0.6) saturate(2) hue-rotate(5deg) brightness(0.9) contrast(1.05) drop-shadow(0 0 40px rgba(201, 168, 76, 0.5)) drop-shadow(0 0 80px rgba(201, 168, 76, 0.2))",
        }}
        priority
      />
    </div>
  )
}
