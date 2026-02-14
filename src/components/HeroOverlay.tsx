export default function HeroOverlay() {
  return (
    <section className="h-screen flex flex-col items-center justify-center pointer-events-none relative z-10">
      {/* Centered hero content */}
      <div className="text-center">
        <h1
          className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-[-0.03em] text-white mb-3"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          kr8tiv
        </h1>
        <div
          className="text-lg sm:text-xl md:text-2xl font-light tracking-[0.15em] uppercase text-white/30 mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          AI
        </div>
        <p
          className="text-base sm:text-lg md:text-xl font-light tracking-[0.05em] text-white/50 mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Surfing the singularity.
        </p>
        <p className="text-sm sm:text-base text-white/30 max-w-xl mx-auto leading-relaxed px-4">
          The event horizon is here. Industries are collapsing into intelligence.
          We're not watching — we're building the layer underneath all of it.
          Open source. Tokenized. Yours.
        </p>

        {/* Scroll indicator */}
        <div className="mt-20 flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <span className="text-[8px] tracking-[0.3em] uppercase text-white/15 font-mono">
            Scroll
          </span>
        </div>
      </div>

      {/* Corner telemetry — subtle, nearly invisible */}
      <div className="absolute top-24 left-8 text-[8px] font-mono text-white/10 hidden lg:block">
        <div>STATUS: BUILDING</div>
        <div className="mt-0.5">VIBE: IMMACULATE</div>
        <div className="mt-0.5 text-white/20">CODE: PUBLIC</div>
      </div>

      <div className="absolute top-24 right-8 text-[8px] font-mono text-white/10 text-right hidden lg:block">
        <div>REVENUE: SHARED</div>
        <div className="mt-0.5">BOXES: ZERO BLACK</div>
      </div>
    </section>
  )
}
