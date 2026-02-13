export default function HeroOverlay() {
  return (
    <section className="h-screen flex flex-col items-center justify-center pointer-events-none relative z-10">
      {/* Centered hero content */}
      <div className="text-center">
        <div className="text-[10px] tracking-[0.5em] uppercase text-[#00e5ff]/50 mb-6 font-mono">
          Introducing
        </div>
        <h1
          className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-[-0.02em] text-white mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          JARVIS
        </h1>
        <p className="text-base sm:text-lg text-white/40 max-w-md mx-auto leading-relaxed px-4">
          The AI-powered trading terminal that sees what others miss.
        </p>

        {/* Scroll indicator */}
        <div className="mt-16 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-[9px] tracking-[0.3em] uppercase text-white/20">
            Scroll to explore
          </span>
          <svg
            width="16"
            height="24"
            viewBox="0 0 16 24"
            fill="none"
            className="opacity-20"
          >
            <path
              d="M8 4V20M8 20L2 14M8 20L14 14"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Corner HUD decorations */}
      <div className="absolute top-24 left-8 text-[9px] font-mono text-[#00e5ff]/30 hidden lg:block">
        <div>LAT 37.7749</div>
        <div>LNG -122.4194</div>
        <div className="mt-1 text-[#d4a853]/40">SOLANA MAINNET</div>
      </div>

      <div className="absolute top-24 right-8 text-[9px] font-mono text-[#00e5ff]/30 text-right hidden lg:block">
        <div>SYS.ACTIVE</div>
        <div>LATENCY 47ms</div>
        <div className="mt-1 text-[#d4a853]/40">v4.6 OPUS</div>
      </div>
    </section>
  )
}
