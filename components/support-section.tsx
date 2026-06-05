"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

export function SupportSection() {
  const [copied, setCopied] = useState(false)
  const upiId = "kamalreddi2901@okaxis"

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <section className="w-full max-w-[700px] mx-auto px-6 py-8">
      {/* Gold divider */}
      <div className="w-full h-px bg-[#c9a84c]/20 mb-6" />
      
      {/* Designer credit - elegant and minimal */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 px-2">
        <div className="h-px w-6 sm:w-12 bg-[#c9a84c]/30 flex-shrink-0"></div>
        <p className="text-[#c9a84c]/70 font-serif text-xs sm:text-sm text-center tracking-wider whitespace-nowrap">
          Designed by Kamal Reddy :)
        </p>
        <div className="h-px w-6 sm:w-12 bg-[#c9a84c]/30 flex-shrink-0"></div>
      </div>
      
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="font-serif text-[#c9a84c] text-lg sm:text-xl tracking-[0.1em]">
          Support the Developer
        </h2>
        
        <p className="text-[#e8e0d0]/80 font-sans text-xs sm:text-sm max-w-md">
          If you find this project interesting, consider supporting the developer.
        </p>

        {/* UPI ID with copy button */}
        <div className="flex flex-col items-center gap-2 w-full max-w-sm">
          <p className="text-[#c9a84c]/60 font-serif text-xs tracking-wider uppercase">
            UPI ID
          </p>
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 px-4 py-2.5 bg-[#c9a84c]/5 border border-[#c9a84c]/30 rounded">
              <p className="text-[#e8e0d0] font-mono text-sm text-center">
                {upiId}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="p-2.5 border border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c]/10 hover:shadow-[0_0_15px_rgba(201,168,76,0.3)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0806] rounded"
              aria-label={copied ? "Copied" : "Copy UPI ID"}
              type="button"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <p className="text-[#e8e0d0]/70 font-sans text-xs italic mt-1">
          Every contribution helps keep this free & updated • I'm just a student ✌️
        </p>
      </div>
    </section>
  )
}
