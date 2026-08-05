import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  PAGE_EVOLVE,
  PAGE_JARVIS,
  PAGE_KIN,
  sections,
  type Section,
} from '../config/sections'
import HudPanel from './ui/HudPanel'

gsap.registerPlugin(ScrollTrigger)

// Shared text shadow for readability over 3D background
const textShadow = '0 0 20px rgba(5,5,16,0.95), 0 0 50px rgba(5,5,16,0.8), 0 2px 30px rgba(5,5,16,0.9)'
const titleShadow = '0 0 30px rgba(5,5,16,0.95), 0 0 60px rgba(5,5,16,0.8), 0 2px 40px rgba(5,5,16,0.9)'

function getViewportFlags() {
  if (typeof window === 'undefined') {
    return { isCompactDesktop: false, isSmallMobile: false }
  }

  const width = window.innerWidth
  const height = window.innerHeight

  return {
    isCompactDesktop: width <= 1366 || height <= 800,
    isSmallMobile: width <= 390 || height <= 700,
  }
}

/** Off-site links open in a new tab; our own static pages stay in this one. */
function linkTarget(href: string) {
  return /^https?:\/\//i.test(href)
    ? { target: '_blank', rel: 'noopener noreferrer' as const }
    : {}
}

const DENSITY_DWELL_BOOST: Record<Section['density'], number> = {
  compact: 0,
  standard: 180,
  dense: 380,
}

export default function ScrollSections() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [{ isCompactDesktop, isSmallMobile }, setViewportFlags] = useState(getViewportFlags)

  useEffect(() => {
    const onResize = () => setViewportFlags(getViewportFlags())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useGSAP(() => {
    if (!containerRef.current) return

    const sectionEls = containerRef.current.querySelectorAll('.content-section')

    sectionEls.forEach((el, i) => {
      // Skip hero section (index 0)
      if (i === 0) return

      const inner = el.querySelector('.section-inner')
      const hudPanel = el.querySelector('.hud-panel')
      const hudDataItems = el.querySelectorAll('.hud-data-item')
      const hudLines = el.querySelectorAll('.hud-connector')
      const sectionData = sections[i - 1]

      // Footer (the section after the last data section): fade in and STAY —
      // it's the conversion endpoint, it must never scrub back out.
      if (inner && !sectionData) {
        gsap.fromTo(
          inner,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 65%',
              toggleActions: 'play none none reverse',
            },
          }
        )
        return
      }

      if (!inner || !sectionData) return

      const viewportDwellBoost = isSmallMobile ? 380 : isCompactDesktop ? 220 : 0
      const sectionDwell = 1600 + DENSITY_DWELL_BOOST[sectionData.density] + viewportDwellBoost
      const entryY = isSmallMobile ? 12 : isCompactDesktop ? 16 : 22
      const entryScale = isSmallMobile ? 0.995 : isCompactDesktop ? 0.988 : 0.98
      const exitY = isSmallMobile ? -8 : isCompactDesktop ? -12 : -16
      const hudInX = isSmallMobile ? 18 : isCompactDesktop ? 24 : 28
      const hudOutX = isSmallMobile ? 10 : isCompactDesktop ? 14 : 16

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: `+=${sectionDwell}`,
          pin: true,
          pinSpacing: true,
          scrub: isSmallMobile ? 1.05 : 1.2,
          anticipatePin: 1,
        },
      })

      // Fade in text (first 20%)
      tl.fromTo(
        inner,
        { opacity: 0, y: entryY, scale: entryScale },
        { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: 'power3.out' }
      )

      // HUD panel pops out
      if (hudPanel) {
        tl.fromTo(
          hudPanel,
          { opacity: 0, x: sectionData.alignment === 'left' ? hudInX : -hudInX, scale: 0.86 },
          { opacity: 1, x: 0, scale: 1, duration: 0.2, ease: 'back.out(1.4)' },
          '<0.05'
        )
      }

      // HUD data items stagger in
      if (hudDataItems.length) {
        tl.fromTo(
          hudDataItems,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.1, stagger: 0.03, ease: 'power2.out' },
          '<0.05'
        )
      }

      // Connector lines animate
      if (hudLines.length) {
        tl.fromTo(
          hudLines,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.1, ease: 'power2.out' },
          '<'
        )
      }

      // Hold visible (middle 60%)
      tl.to(inner, { opacity: 1, duration: 0.6 })
      if (hudPanel) {
        tl.to(hudPanel, { opacity: 1, duration: 0.6 }, '<')
      }

      // Fade out (last 20%)
      tl.to(inner, { opacity: 0, y: exitY, duration: 0.2, ease: 'power2.in' })
      if (hudPanel) {
        tl.to(
          hudPanel,
          {
            opacity: 0,
            x: sectionData.alignment === 'left' ? -hudOutX : hudOutX,
            duration: 0.15,
            ease: 'power2.in',
          },
          '<'
        )
      }
    })
  }, [isCompactDesktop, isSmallMobile])

  return (
    <div ref={containerRef} className="scroll-container relative z-10">
      {/* Hero section — empty (content in HeroOverlay) */}
      <section className="content-section h-screen" />

      {/* Content sections */}
      {sections.map((section, i) => (
        <section
          key={i}
          className={`content-section h-screen flex ${
            isSmallMobile ? 'items-start' : 'items-center'
          } pointer-events-none relative ${
            isSmallMobile ? 'pt-12' : isCompactDesktop ? 'pt-14 md:pt-16' : 'pt-16 md:pt-20'
          }`}
        >
          {/* Phone-only scrim: the 3D scene now moves a lot more behind the
              copy, and a dark wash keeps the paragraph readable at every beat. */}
          {isSmallMobile ? (
            <div
              className="absolute inset-x-0 top-0 h-[78%] pointer-events-none"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(5,5,16,0.9) 0%, rgba(5,5,16,0.78) 55%, rgba(5,5,16,0) 100%)',
              }}
            />
          ) : (
            /* Desktop: a soft wash under the text column only — the lit machine
               is much brighter now, and white-on-metal was losing contrast. */
            <div
              className="absolute inset-y-0 hidden md:block pointer-events-none"
              style={{
                [section.alignment === 'left' ? 'left' : 'right']: 0,
                width: '58%',
                background: `linear-gradient(to ${section.alignment === 'left' ? 'right' : 'left'}, rgba(5,5,16,0.82) 0%, rgba(5,5,16,0.55) 45%, rgba(5,5,16,0) 100%)`,
              }}
            />
          )}

          {/* Text content side */}
          <div
            className={`section-inner opacity-0 flex flex-col xl:flex-row items-start ${
              isSmallMobile ? 'gap-3 sm:gap-4 xl:gap-5' : isCompactDesktop ? 'gap-4 xl:gap-6' : 'gap-6 xl:gap-8'
            } w-full ${
              isSmallMobile ? 'px-4 sm:px-5' : 'px-5 sm:px-7 lg:px-8'
            } relative z-10 ${
              section.alignment === 'left'
                ? 'xl:ml-[6vw] xl:mr-auto xl:max-w-[85vw]'
                : 'xl:ml-auto xl:mr-[6vw] xl:max-w-[85vw] xl:flex-row-reverse'
            }`}
            data-testid={`section-inner-${i}`}
            data-density={section.density}
          >
            {/* Text block */}
            <div className={`section-text flex-shrink-0 ${
              section.density === 'dense' && (isCompactDesktop || isSmallMobile)
                ? isSmallMobile
                  ? 'max-w-[min(96vw,31rem)]'
                  : 'max-w-[min(95vw,34rem)]'
                : 'max-w-[min(94vw,30rem)]'
            }`}>
              <span
                className={`uppercase tracking-[0.32em] font-medium block font-mono ${
                  isSmallMobile ? 'text-[9px] mb-2.5' : isCompactDesktop ? 'text-[9.5px] mb-3' : 'text-[10px] mb-4'
                }`}
                style={{ color: `${section.hudColor}cc`, textShadow }}
              >
                {section.label}
              </span>
              <h2
                className={`section-title title-glow font-light text-white whitespace-pre-line pointer-events-auto ${
                  isSmallMobile
                    ? 'text-[clamp(2rem,10vw,3.2rem)] mb-2.5 leading-[1.02]'
                    : isCompactDesktop
                      ? section.density === 'dense'
                        ? 'text-[clamp(1.95rem,5.9vw,3.8rem)] mb-3 leading-[1.02]'
                        : 'text-[clamp(2.05rem,6.2vw,4.05rem)] mb-3.5 leading-[1.03]'
                      : 'text-[clamp(2.35rem,7vw,4.85rem)] mb-4 md:mb-5 leading-[1.04]'
                }`}
                style={{ fontFamily: 'var(--font-display)', textShadow: titleShadow }}
              >
                {section.title}
              </h2>
              <p
                className={`section-copy text-white/80 ${
                  section.density === 'dense' && (isCompactDesktop || isSmallMobile)
                    ? isSmallMobile
                      ? 'max-w-[min(95vw,31rem)]'
                      : 'max-w-[min(92vw,33rem)]'
                    : 'max-w-[min(92vw,29rem)]'
                } ${
                  isSmallMobile
                    ? 'text-[clamp(0.86rem,3.8vw,0.99rem)] leading-[1.3]'
                    : isCompactDesktop
                      ? section.density === 'dense'
                        ? 'text-[clamp(0.88rem,1.45vw,0.98rem)] leading-[1.33]'
                        : 'text-[clamp(0.9rem,1.55vw,1.04rem)] leading-[1.35]'
                      : 'text-[clamp(0.93rem,1.65vw,1.12rem)] leading-[1.42]'
                }`}
                data-testid={`section-copy-${i}`}
                style={{ textShadow }}
              >
                {section.copy}
              </p>

              {/* Proof line — first section only */}
              {i === 0 && (
                <div className="flex items-center gap-3 mt-6 pointer-events-auto">
                  <span className="text-[11px] tracking-[0.1em] text-white/50 font-mono">
                    Running in production today &middot; Edmonton, Alberta
                  </span>
                </div>
              )}

              {/* Single CTA */}
              {section.cta && !section.ctas && (
                <a
                  href={section.cta.href}
                  {...linkTarget(section.cta.href)}
                  className="pointer-events-auto inline-block mt-8 px-8 py-3 border text-white text-xs tracking-[0.2em] uppercase hover:bg-white/5 transition-all duration-300"
                  style={{ borderColor: `${section.hudColor}40` }}
                >
                  {section.cta.text}
                </a>
              )}

              {/* Multiple CTAs — uniform width grid */}
              {section.ctas && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mt-6 sm:mt-8 pointer-events-auto max-w-[min(95vw,480px)]">
                  {section.ctas.map((cta, j) => (
                    <a
                      key={j}
                      href={cta.href}
                      {...linkTarget(cta.href)}
                      className={`flex items-center justify-center px-4 py-2.5 border text-white text-[11px] tracking-[0.15em] uppercase hover:bg-white/5 transition-all duration-300 ${
                        section.ctas && j === section.ctas.length - 1 && section.ctas.length % 2 !== 0
                          ? 'sm:col-span-2'
                          : ''
                      }`}
                      style={{ borderColor: `${section.hudColor}40` }}
                    >
                      {cta.text}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* HUD Panel */}
            <HudPanel section={section} index={i} compact={isSmallMobile} />
          </div>
        </section>
      ))}

      {/* Footer / CTA — min-h so the tagline and credit stay reachable when the
          content is taller than the viewport (it is, on phones). */}
      <section className="content-section min-h-screen py-20 sm:py-24 flex items-center justify-center relative">
        <div className={`section-inner opacity-0 text-center max-w-[min(94vw,52rem)] relative z-10 ${
          isSmallMobile ? 'px-4' : 'px-5 sm:px-6'
        }`}>
          <h2
            className={`title-glow font-light text-white pointer-events-auto ${
              isSmallMobile
                ? 'text-[clamp(1.95rem,10vw,3rem)] mb-2.5 leading-[1.04]'
                : isCompactDesktop
                  ? 'text-[clamp(2.05rem,6.4vw,4rem)] mb-3 leading-[1.05]'
                  : 'text-[clamp(2.25rem,7vw,4.8rem)] mb-4 leading-[1.06]'
            }`}
            style={{ fontFamily: 'var(--font-display)', textShadow: titleShadow }}
          >
            Get your evenings back.<br />Start with an audit.
          </h2>
          <p
            className={`text-white/70 max-w-[min(92vw,40rem)] mx-auto ${
              isSmallMobile
                ? 'text-[clamp(0.8rem,3.7vw,0.9rem)] mb-6 leading-[1.38]'
                : isCompactDesktop
                  ? 'text-[clamp(0.82rem,1.35vw,0.95rem)] mb-7 sm:mb-8 leading-[1.43]'
                  : 'text-[clamp(0.84rem,1.45vw,0.98rem)] mb-8 sm:mb-10 leading-[1.5]'
            }`}
            style={{ textShadow }}
          >
            Every engagement starts the same way: one week inside your operation,
            mapping where the hours actually go. You get a written plan of what an
            AI back-office would take off your plate and what it costs to build.
            Fixed scope, no lock-in &mdash; and the source code for everything we
            build for you is handed over, so the system that runs your business
            stays yours.
          </p>

          {/* Engagement ladder */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mx-auto max-w-[min(94vw,54rem)] pointer-events-auto text-left ${
              isSmallMobile ? 'mb-6' : 'mb-8 sm:mb-10'
            }`}
          >
            {[
              {
                step: '01',
                name: 'AI Ops Audit',
                detail: 'One week. We map your operation, find the hours, and hand you the plan — keep it either way.',
              },
              {
                step: '02',
                name: 'Back-Office Build',
                detail: 'We wire the agents into the tools you already run — receipts, quotes, dispatch, digests.',
              },
              {
                step: '03',
                name: 'Care',
                detail: 'The system watches your business; we watch the system. Tuning, new automations, no lock-in.',
              },
            ].map((tier) => (
              <div
                key={tier.step}
                className="border border-white/12 bg-black/40 backdrop-blur-sm p-4 sm:p-5 hover:border-[#d4a853]/40 transition-colors duration-300"
              >
                <div className="text-[9px] font-mono tracking-[0.3em] text-[#d4a853]/80 mb-2">
                  {tier.step}
                </div>
                <div
                  className="text-white text-sm sm:text-base mb-1.5"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {tier.name}
                </div>
                <div className="text-white/55 text-[11px] sm:text-xs leading-relaxed">
                  {tier.detail}
                </div>
              </div>
            ))}
          </div>

          {/* Primary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10 pointer-events-auto">
            <a
              href="mailto:hello@kr8tiv.ai?subject=AI%20Ops%20Audit"
              className="px-8 py-3 bg-[#d4a853]/10 border border-[#d4a853]/50 text-white text-xs tracking-[0.2em] uppercase hover:border-[#d4a853] hover:bg-[#d4a853]/20 transition-all duration-300 backdrop-blur-sm"
            >
              Book an AI Ops Audit &rarr;
            </a>
            <a
              href="tel:+17809155471"
              className="px-8 py-3 bg-black/60 border border-white/20 text-white text-xs tracking-[0.18em] uppercase font-mono hover:border-white/40 hover:bg-black/80 transition-all duration-300 backdrop-blur-sm"
            >
              780-915-5471
            </a>
            <a
              href="https://kr8tiv.io/start/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-black/60 border border-white/20 text-white text-xs tracking-[0.2em] uppercase hover:border-white/40 hover:bg-black/80 transition-all duration-300 backdrop-blur-sm"
            >
              Fill the intake &rarr;
            </a>
          </div>

          {/* Deeper reading — static pages, available at every breakpoint */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 pointer-events-auto mb-10">
            {[
              { label: 'Evolve case study', href: PAGE_EVOLVE },
              { label: 'JARVIS', href: PAGE_JARVIS },
              { label: 'KIN', href: PAGE_KIN },
              { label: 'kr8tiv.io — design studio', href: 'https://kr8tiv.io' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                {...linkTarget(link.href)}
                className="text-[10px] tracking-[0.18em] uppercase text-white/45 hover:text-[#d4a853] transition-colors duration-300"
                style={{ textShadow }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Social icons — wraps instead of running off both edges at 320px */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-5 sm:gap-6 pointer-events-auto mb-12">
            <a href="https://x.com/kr8tivai" target="_blank" rel="noopener noreferrer"
               className="group flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/5 transition-all duration-300">
                <span className="text-white/50 group-hover:text-white text-sm transition-colors">&#x1D54F;</span>
              </div>
              <span className="text-[9px] tracking-[0.2em] uppercase text-white/20 font-mono">Twitter</span>
            </a>

            <a href="https://www.linkedin.com/company/kr8tivai" target="_blank" rel="noopener noreferrer"
               className="group flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/5 transition-all duration-300">
                <svg className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </div>
              <span className="text-[9px] tracking-[0.2em] uppercase text-white/20 font-mono">LinkedIn</span>
            </a>

            <a href="https://github.com/kr8tiv-ai" target="_blank" rel="noopener noreferrer"
               className="group flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/5 transition-all duration-300">
                <svg className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </div>
              <span className="text-[9px] tracking-[0.2em] uppercase text-white/20 font-mono">GitHub</span>
            </a>

            <a href="https://t.me/kr8tivaisystems" target="_blank" rel="noopener noreferrer"
               className="group flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/5 transition-all duration-300">
                <svg className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </div>
              <span className="text-[9px] tracking-[0.2em] uppercase text-white/20 font-mono">Telegram</span>
            </a>

            <a href="mailto:hello@kr8tiv.ai"
               className="group flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/5 transition-all duration-300">
                <span className="text-white/50 group-hover:text-white text-sm transition-colors">@</span>
              </div>
              <span className="text-[9px] tracking-[0.2em] uppercase text-white/20 font-mono">Contact</span>
            </a>
          </div>

          {/* Tagline */}
          <div className="text-[10px] font-mono text-white/50 tracking-[0.15em] mb-4" style={{ textShadow }}>
            Fewer forms. Fewer evenings lost. That&apos;s the whole business.
          </div>

          <div className="text-[8px] font-mono text-white/30 tracking-[0.3em] uppercase mb-3" style={{ textShadow }}>
            &copy; 2026 kr8tiv AI &mdash; All systems nominal
          </div>

          {/* Sister-brand credit */}
          <a
            href="https://kr8tiv.io"
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto text-[9px] font-mono tracking-[0.2em] uppercase text-white/25 hover:text-[#d4a853]/80 transition-colors duration-300"
            style={{ textShadow }}
          >
            Design by kr8tiv.io &mdash; the atelier side of the house
          </a>
        </div>
      </section>
    </div>
  )
}
