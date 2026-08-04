import { AUDIT_MAILTO, PHONE_DISPLAY, PHONE_HREF } from '../config/sections'

export default function HeroOverlay() {
  return (
    <section className="h-screen relative pointer-events-none z-10">
      {/* Mobile scrim — keeps hero copy legible over the 3D scene */}
      <div
        className="absolute inset-x-0 bottom-0 h-[70%] md:hidden"
        style={{
          background:
            'linear-gradient(to top, rgba(5,5,16,0.92) 0%, rgba(5,5,16,0.72) 45%, rgba(5,5,16,0) 100%)',
        }}
      />

      {/* Hero copy — editorial bottom-left on desktop, centered-bottom on mobile */}
      <div className="absolute inset-x-0 bottom-0 px-6 sm:px-10 lg:px-[6vw] pb-[12vh] md:pb-[10vh] flex flex-col items-center md:items-start text-center md:text-left">
        <div
          className="text-[10px] sm:text-[11px] tracking-[0.4em] uppercase text-white/40 font-mono mb-4 sm:mb-5"
        >
          kr8tiv AI · Edmonton → Everywhere
        </div>

        <h1
          className="title-glow text-[clamp(2.4rem,7.5vw,5.5rem)] font-bold tracking-[-0.03em] leading-[1.02] text-white mb-4 sm:mb-6 pointer-events-auto max-w-[92vw] md:max-w-[14em]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Your back office,
          <br />
          automated.
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-white/75 max-w-[92vw] sm:max-w-xl leading-relaxed mb-7 sm:mb-9">
          We build AI operations systems for real businesses — quoting, receipts,
          dispatch, daily reporting — running around the clock on the tools you
          already use. Built for you, handed over to you.
        </p>

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 pointer-events-auto">
          <a
            href={AUDIT_MAILTO}
            className="px-6 sm:px-8 py-3 bg-[#d4a853]/10 border border-[#d4a853]/50 text-white text-[11px] sm:text-xs tracking-[0.2em] uppercase hover:bg-[#d4a853]/20 hover:border-[#d4a853] transition-all duration-300 backdrop-blur-sm"
          >
            Book an AI Ops Audit →
          </a>
          <a
            href={PHONE_HREF}
            className="px-6 sm:px-8 py-3 border border-white/20 text-white/80 text-[11px] sm:text-xs tracking-[0.18em] uppercase font-mono hover:border-white/50 hover:text-white transition-all duration-300 backdrop-blur-sm"
          >
            {PHONE_DISPLAY}
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="mt-10 sm:mt-12 flex flex-col items-center md:items-start gap-2">
          <div className="w-px h-14 bg-gradient-to-b from-transparent via-white/25 to-transparent md:ml-6" />
          <span className="text-[8px] tracking-[0.3em] uppercase text-white/25 font-mono">
            Scroll — watch it work
          </span>
        </div>
      </div>

      {/* Corner telemetry — desktop only */}
      <div className="absolute top-24 left-8 text-[8px] font-mono text-white/10 hidden lg:block">
        <div>STATUS: SHIPPING</div>
        <div className="mt-0.5">BACK OFFICES: RUNNING</div>
        <div className="mt-0.5 text-white/20">SOURCE: YOURS</div>
      </div>

      <div className="absolute top-24 right-8 text-[8px] font-mono text-white/10 text-right hidden lg:block">
        <div>MIGRATIONS: ZERO</div>
        <div className="mt-0.5">BLACK BOXES: ZERO</div>
      </div>
    </section>
  )
}
