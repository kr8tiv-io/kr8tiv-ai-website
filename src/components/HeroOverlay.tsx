export default function HeroOverlay() {
  return (
    <section className="h-screen flex flex-col items-center justify-center pointer-events-none relative z-10 px-4 sm:px-6">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(5,5,16,0.85) 0%, rgba(5,5,16,0.4) 50%, transparent 80%)',
        }}
      />

      <div className="text-center relative z-10 max-w-[min(92vw,64rem)]" data-testid="hero-content">
        <h1
          data-testid="hero-headline"
          className="title-glow font-bold tracking-[-0.03em] text-white mb-2 pointer-events-auto leading-[0.9]"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3.35rem, 10.8vw, 8.3rem)',
            textShadow: '0 0 40px rgba(5,5,16,0.9), 0 0 80px rgba(5,5,16,0.6)',
          }}
        >
          kr8tiv
        </h1>
        <div
          className="font-light tracking-[0.14em] uppercase text-white/30 mb-[clamp(0.75rem,2.2vh,1.5rem)]"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1rem, 2.6vw, 1.45rem)',
          }}
        >
          AI
        </div>
        <p
          className="font-light tracking-[0.04em] text-white/80 mb-[clamp(0.8rem,2.2vh,1.5rem)]"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(0.98rem, 2.2vw, 1.35rem)',
            textShadow: '0 0 20px rgba(5,5,16,0.95), 0 0 60px rgba(5,5,16,0.8)',
          }}
        >
          Surfing the singularity.
        </p>
        <p
          data-testid="hero-copy"
          className="text-white/70 mx-auto leading-[1.5] px-2 sm:px-4"
          style={{
            fontSize: 'clamp(0.84rem, 1.55vw, 1.05rem)',
            maxWidth: 'min(88vw, 42rem)',
            textShadow: '0 0 16px rgba(5,5,16,0.95), 0 0 40px rgba(5,5,16,0.8)',
          }}
        >
          The event horizon is here. Industries are collapsing into intelligence. We&apos;re not
          watching - we&apos;re building the layer underneath all of it. Open source. Tokenized. Yours.
        </p>

        <div className="mt-[clamp(1.8rem,8.5vh,5rem)] flex flex-col items-center gap-2 sm:gap-3">
          <div className="w-px h-[clamp(2.5rem,10vh,5rem)] bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          <span className="text-[8px] tracking-[0.3em] uppercase text-white/20 font-mono">Scroll</span>
        </div>
      </div>

      <div className="absolute top-20 left-6 text-[8px] font-mono text-white/10 hidden xl:block">
        <div>STATUS: BUILDING</div>
        <div className="mt-0.5">VIBE: IMMACULATE</div>
        <div className="mt-0.5 text-white/20">CODE: PUBLIC</div>
      </div>

      <div className="absolute top-20 right-6 text-[8px] font-mono text-white/10 text-right hidden xl:block">
        <div>REVENUE: SHARED</div>
        <div className="mt-0.5">BOXES: ZERO BLACK</div>
      </div>
    </section>
  )
}
