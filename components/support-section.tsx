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
        
        <p className="text-[#e8e0d0]/80 font-sans text-xs sm:text-sm max-w-md px-4">
          If you find this project interesting, consider supporting the developer.
        </p>

        {/* UPI ID with copy button - inline compact design */}
        <div className="flex items-center gap-2">
          <p className="text-[#e8e0d0] font-mono text-xs sm:text-sm">
            <span className="text-[#c9a84c]/70">UPI ID:</span> {upiId}
          </p>
          <button
            onClick={handleCopy}
            className="p-1.5 text-[#c9a84c] hover:text-[#d4b55c] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0a0806] rounded"
            aria-label={copied ? "Copied" : "Copy UPI ID"}
            type="button"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>

        <p className="text-[#e8e0d0]/70 font-sans text-xs italic">
          Every contribution helps keep this free & updated • I'm just a student ✌️
        </p>
      </div>
    </section>
  )
}
