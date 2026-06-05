import { VideoPlayer } from "@/components/video-player"
import { SupportSection } from "@/components/support-section"
import { DustParticles } from "@/components/dust-particles"
import { CinematicLogo } from "@/components/cinematic-logo"

export default function Page() {
  return (
    <main className="relative min-h-screen bg-[#0a0806] text-[#e8e0d0] overflow-x-hidden">
      {/* Subtle gradient background for depth */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 20%, rgba(201, 168, 76, 0.03) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 50% 80%, rgba(139, 94, 26, 0.04) 0%, transparent 50%)',
        }}
      />
      
      {/* Dust Particles Background */}
      <DustParticles />
      
      {/* Texture Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center py-12 md:py-20">
        {/* Logo */}
        <CinematicLogo />

        {/* Tagline */}
        <p className="font-serif text-[#c9a84c] text-[10px] md:text-xs lg:text-sm tracking-[0.25em] uppercase mb-3 px-4 text-center">
          An SS Rajamouli Film
        </p>

        {/* Subtitle */}
        <p className="font-serif text-[#e8e0d0] text-[10px] md:text-xs tracking-[0.2em] uppercase mb-12 md:mb-16 px-4 text-center">
          Experience The Formats
        </p>

        {/* Video Player Section */}
        <VideoPlayer />

        {/* Divider */}
        <div className="w-[90vw] md:w-[85vw] lg:w-[75vw] max-w-[900px] h-px bg-[#c9a84c]/15 my-12 md:my-16" />

        {/* SSR Speech Section */}
        <section className="flex flex-col items-center w-full px-4">
          <h2 className="font-serif text-[#c9a84c] text-xs md:text-sm lg:text-base tracking-[0.15em] uppercase text-center mb-6">
            SSR Speech at Globetrotter Event:
          </h2>
          <div 
            className="w-[95vw] md:w-[85vw] lg:w-[min(75vw,900px)] border border-[#c9a84c]/25"
            style={{
              boxShadow: '0 0 30px rgba(201, 168, 76, 0.08), 0 0 60px rgba(201, 168, 76, 0.04)',
            }}
          >
            <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
              <iframe
                src="https://www.youtube.com/embed/muuCXAlM7CU"
                title="SSR Speech at Globetrotter Event"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        </section>

        {/* Support Section */}
        <SupportSection />

        {/* Footer */}
        <footer className="mt-8 pb-10 px-4">
          <p className="font-serif text-[#c9a84c] text-[10px] md:text-xs tracking-[0.2em] uppercase text-center">
            Filmed for IMAX · In Cinemas April 2027
          </p>
        </footer>
      </div>

      {/* Vignette Effect */}
      <div className="fixed inset-0 pointer-events-none z-[2] shadow-[inset_0_0_200px_80px_rgba(0,0,0,0.8)]" />
    </main>
  )
}
