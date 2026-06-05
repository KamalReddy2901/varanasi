"use client"

import { useState } from "react"
import Image from "next/image"

export function SupportSection() {
  const [showQR, setShowQR] = useState(false)

  const handleUPIClick = () => {
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent)
    
    if (isMobile) {
      window.location.href = "upi://pay?pa=kamalreddi2901@okaxis&pn=Kamal%20Reddy&tn=Jai%20Babu&cu=INR"
    } else {
      setShowQR(!showQR)
    }
  }

  return (
    <section className="w-full max-w-[800px] mx-auto px-6 py-12">
      {/* Gold divider */}
      <div className="w-full h-px bg-[#c9a84c]/20 mb-8" />
      
      {/* Designer credit - elegant and minimal */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="h-px w-12 bg-[#c9a84c]/30"></div>
        <p className="text-[#c9a84c]/70 font-serif text-sm text-center tracking-wider">
          Designed by Kamal Reddy :)
        </p>
        <div className="h-px w-12 bg-[#c9a84c]/30"></div>
      </div>
      
      <div className="flex flex-col items-center gap-6 text-center">
        <h2 className="font-serif text-[#c9a84c] text-xl tracking-[0.1em]">
          Support the Developer
        </h2>
        
        <p className="text-[#e8e0d0] font-sans text-sm">
          If you find this project interesting, consider supporting the developer.
        </p>

        <button
          onClick={handleUPIClick}
          className="px-8 py-3 font-serif text-[#c9a84c] text-sm tracking-[0.1em] uppercase border border-[#c9a84c] bg-transparent hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all duration-200"
        >
          Pay with any UPI App
        </button>

        {/* QR Code (Desktop only) */}
        {showQR && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-3 pt-4">
              <Image
                src="/upi-qr.png"
                alt="UPI QR Code - Kamal Reddy"
                width={280}
                height={350}
                className="rounded-lg shadow-lg"
                priority
                quality={95}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-1">
          <p className="text-[#e8e0d0] font-sans text-xs italic">
            Every contribution helps keep this project free and updated!
          </p>
          <p className="text-[#e8e0d0]/50 font-sans text-xs italic">
            (PS: I'm just a student ✌️)
          </p>
        </div>
      </div>
    </section>
  )
}
