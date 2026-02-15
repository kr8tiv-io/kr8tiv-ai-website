export default function HeroOverlay() {
  return (
    <section className="h-screen flex flex-col items-center justify-center pointer-events-none relative z-10">
      {/* Dark radial backdrop — ensures text is always readable over 3D scene */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(5,5,16,0.85) 0%, rgba(5,5,16,0.4) 50%, transparent 80%)',
        }}
      />

      {/* Centered hero content */}
      <div className="text-center relative z-10">
        <h1
          className="title-glow text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-[-0.03em] text-white mb-3 pointer-events-auto"
          style={{ fontFamily: 'var(--font-display)', textShadow: '0 0 40px rgba(5,5,16,0.9), 0 0 80px rgba(5,5,16,0.6)' }}
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
          className="text-base sm:text-lg md:text-xl font-light tracking-[0.05em] text-white/80 mb-6"
          style={{
            fontFamily: 'var(--font-display)',
            textShadow: '0 0 20px rgba(5,5,16,0.95), 0 0 60px rgba(5,5,16,0.8)',
          }}
        >
          Surfing the singularity.
        </p>
        <p
          className="text-sm sm:text-base text-white/70 max-w-xl mx-auto leading-relaxed px-4"
          style={{
            textShadow: '0 0 16px rgba(5,5,16,0.95), 0 0 40px rgba(5,5,16,0.8)',
          }}
        >
          The event horizon is here. Industries are collapsing into intelligence.
          We're not watching — we're building the layer underneath all of it.
          Open source. Tokenized. Yours.
        </p>

        {/* Scroll indicator — bigger line */}
        <div className="mt-20 flex flex-col items-center gap-3">
          <div className="w-px h-20 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          <span className="text-[8px] tracking-[0.3em] uppercase text-white/20 font-mono">
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
