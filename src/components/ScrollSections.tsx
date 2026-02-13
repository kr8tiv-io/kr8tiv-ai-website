import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sections } from '../config/sections'
import HudPanel from './ui/HudPanel'

gsap.registerPlugin(ScrollTrigger)

export default function ScrollSections() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current) return

    const sectionEls = containerRef.current.querySelectorAll('.content-section')
    const totalSections = sections.length + 1 // +1 for hero

    sectionEls.forEach((el, i) => {
      // Skip hero section (index 0)
      if (i === 0) return

      const inner = el.querySelector('.section-inner')
      const hudPanel = el.querySelector('.hud-panel')
      const hudDataItems = el.querySelectorAll('.hud-data-item')
      const hudLines = el.querySelectorAll('.hud-connector')

      if (!inner) return

      const sectionStart = i / totalSections
      const sectionEnd = (i + 1) / totalSections

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: `${sectionStart * 100}% top`,
          end: `${sectionEnd * 100}% top`,
          scrub: 0.8,
        },
      })

      // Text content fades in and slides up
      tl.fromTo(
        inner,
        { opacity: 0, y: 60, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: 'power3.out' }
      )

      // HUD panel pops out with a snap
      if (hudPanel) {
        tl.fromTo(
          hudPanel,
          { opacity: 0, x: sections[i - 1]?.alignment === 'left' ? 80 : -80, scale: 0.85 },
          { opacity: 1, x: 0, scale: 1, duration: 0.15, ease: 'back.out(1.4)' },
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

      // Hold visible
      tl.to(inner, { opacity: 1, duration: 0.4 })
      if (hudPanel) {
        tl.to(hudPanel, { opacity: 1, duration: 0.4 }, '<')
      }

      // Fade out
      tl.to(inner, { opacity: 0, y: -30, duration: 0.2, ease: 'power2.in' })
      if (hudPanel) {
        tl.to(
          hudPanel,
          {
            opacity: 0,
            x: sections[i - 1]?.alignment === 'left' ? -40 : 40,
            duration: 0.15,
            ease: 'power2.in',
          },
          '<'
        )
      }
    })
  }, [])

  return (
    <div ref={containerRef} className="scroll-container relative z-10">
      {/* Hero section — empty (content in HeroOverlay) */}
      <section className="content-section h-screen" />

      {/* 4 content sections */}
      {sections.map((section, i) => (
        <section
          key={i}
          className="content-section h-screen flex items-center pointer-events-none relative"
        >
          {/* Text content side */}
          <div
            className={`section-inner opacity-0 flex flex-col lg:flex-row items-start gap-8 w-full px-6 sm:px-8 ${
              section.alignment === 'left'
                ? 'lg:ml-[6vw] lg:mr-auto lg:max-w-[85vw]'
                : 'lg:ml-auto lg:mr-[6vw] lg:max-w-[85vw] lg:flex-row-reverse'
            }`}
          >
            {/* Text block */}
            <div className="flex-shrink-0 max-w-md">
              <span
                className="text-[10px] uppercase tracking-[0.4em] font-medium mb-4 block font-mono"
                style={{ color: section.hudColor }}
              >
                {section.label}
              </span>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white mb-5 leading-[1.1] whitespace-pre-line"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {section.title}
              </h2>
              <p className="text-sm sm:text-base text-white/50 leading-relaxed max-w-sm">
                {section.copy}
              </p>
              {section.cta && (
                <a
                  href={section.cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto inline-block mt-8 px-8 py-3 border text-white text-xs tracking-[0.2em] uppercase hover:bg-white/5 transition-all duration-300"
                  style={{ borderColor: `${section.hudColor}40` }}
                >
                  {section.cta.text}
                </a>
              )}
            </div>

            {/* HUD Panel — pops out from the side */}
            <HudPanel section={section} index={i} />
          </div>

          {/* Scanline overlay for this section */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.02]"
            style={{
              background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${section.hudColor}15 2px, ${section.hudColor}15 4px)`,
            }}
          />
        </section>
      ))}
    </div>
  )
}
