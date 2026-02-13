export default function HeroOverlay() {
  return (
    <section className="h-screen flex flex-col items-center justify-center pointer-events-none relative z-10">
      {/* Centered hero content */}
      <div className="text-center">
        <div className="text-[10px] tracking-[0.5em] uppercase text-white/20 mb-6 font-mono">
          Autonomous Intelligence
        </div>
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
        <p className="text-sm sm:text-base text-white/30 max-w-lg mx-auto leading-relaxed px-4">
          Building the intelligence layer beneath every industry.
          Open source. Tokenized. Autonomous.
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
        <div>SYS.ACTIVE</div>
        <div className="mt-0.5">MODELS: 8</div>
        <div className="mt-0.5 text-[#00e5ff]/20">LATENCY 47ms</div>
      </div>

      <div className="absolute top-24 right-8 text-[8px] font-mono text-white/10 text-right hidden lg:block">
        <div>OPEN SOURCE</div>
        <div className="mt-0.5">$KR8TIV</div>
        <div className="mt-0.5 text-[#d4a853]/20">MULTI-CHAIN</div>
      </div>
    </section>
  )
}
