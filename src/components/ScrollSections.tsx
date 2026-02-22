import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sections } from '../config/sections'
import HudPanel from './ui/HudPanel'

gsap.registerPlugin(ScrollTrigger)

// Shared text shadow for readability over 3D background
const textShadow = '0 0 20px rgba(5,5,16,0.95), 0 0 50px rgba(5,5,16,0.8), 0 2px 30px rgba(5,5,16,0.9)'
const titleShadow = '0 0 30px rgba(5,5,16,0.95), 0 0 60px rgba(5,5,16,0.8), 0 2px 40px rgba(5,5,16,0.9)'

export default function ScrollSections() {
  const containerRef = useRef<HTMLDivElement>(null)

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

      if (!inner) return

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: '+=1600',
          pin: true,
          pinSpacing: true,
          scrub: 1.2,
          anticipatePin: 1,
        },
      })

      // Fade in text (first 20%)
      tl.fromTo(
        inner,
        { opacity: 0, y: 60, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: 'power3.out' }
      )

      // HUD panel pops out
      if (hudPanel) {
        tl.fromTo(
          hudPanel,
          { opacity: 0, x: sections[i - 1]?.alignment === 'left' ? 80 : -80, scale: 0.85 },
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

      {/* Content sections */}
      {sections.map((section, i) => (
        <section
          key={i}
          className="content-section h-screen flex items-center pointer-events-none relative pt-16 md:pt-20"
        >
          {/* Text content side */}
          <div
            className={`section-inner opacity-0 flex flex-col xl:flex-row items-start gap-6 xl:gap-8 w-full px-5 sm:px-7 lg:px-8 relative z-10 ${
              section.alignment === 'left'
                ? 'xl:ml-[6vw] xl:mr-auto xl:max-w-[85vw]'
                : 'xl:ml-auto xl:mr-[6vw] xl:max-w-[85vw] xl:flex-row-reverse'
            }`}
            data-testid={`section-inner-${i}`}
          >
            {/* Text block */}
            <div className="flex-shrink-0 max-w-[min(94vw,30rem)]">
              <span
                className="text-[10px] uppercase tracking-[0.4em] font-medium mb-4 block font-mono"
                style={{ color: `${section.hudColor}cc`, textShadow }}
              >
                {section.label}
              </span>
              <h2
                className="title-glow text-[clamp(2.35rem,7vw,4.85rem)] font-light text-white mb-4 md:mb-5 leading-[1.04] whitespace-pre-line pointer-events-auto"
                style={{ fontFamily: 'var(--font-display)', textShadow: titleShadow }}
              >
                {section.title}
              </h2>
              <p
                className="text-[clamp(0.93rem,1.65vw,1.12rem)] text-white/80 leading-[1.42] max-w-[min(92vw,29rem)]"
                data-testid={`section-copy-${i}`}
                style={{ textShadow }}
              >
                {section.copy}
              </p>

              {/* Built on Solana · Born on Bags — first section only */}
              {i === 0 && (
                <div className="flex items-center gap-3 mt-6 pointer-events-auto">
                  <span className="text-[11px] tracking-[0.1em] text-white/50 font-mono">
                    Built on Solana &middot; Born on
                  </span>
                  <a
                    href="https://bags.fm/U1zc8QpnrQ3HBJUBrWFYWbQTLzNsCpPgZNegWXdBAGS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 group"
                  >
                    <img
                      src="https://bags.fm/assets/images/bags-icon.png"
                      alt="Bags"
                      className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <span className="text-[11px] tracking-[0.1em] text-white/50 group-hover:text-white/80 font-mono transition-colors duration-300">
                      Bags
                    </span>
                  </a>
                </div>
              )}

              {/* Single CTA */}
              {section.cta && !section.ctas && (
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

              {/* Multiple CTAs — uniform width grid */}
              {section.ctas && (
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-7 sm:mt-8 pointer-events-auto max-w-[min(94vw,380px)]">
                  {section.ctas.map((cta, j) => (
                    <a
                      key={j}
                      href={cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center px-4 py-2.5 border text-white text-[11px] tracking-[0.15em] uppercase hover:bg-white/5 transition-all duration-300 ${
                        section.ctas && j === section.ctas.length - 1 && section.ctas.length % 2 !== 0
                          ? 'col-span-2'
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
            <HudPanel section={section} index={i} />
          </div>
        </section>
      ))}

      {/* Footer / CTA — The future is open */}
      <section className="content-section h-screen flex items-center justify-center relative">
        <div className="section-inner opacity-0 text-center max-w-[min(94vw,52rem)] px-5 sm:px-6 relative z-10">
          <h2
            className="title-glow text-[clamp(2.25rem,7vw,4.8rem)] font-light text-white mb-4 leading-[1.06] pointer-events-auto"
            style={{ fontFamily: 'var(--font-display)', textShadow: titleShadow }}
          >
            The future is open.<br />Come build it.
          </h2>
          <p
            className="text-[clamp(0.84rem,1.45vw,0.98rem)] text-white/70 mb-9 sm:mb-12 leading-[1.5] max-w-[min(92vw,40rem)] mx-auto"
            style={{ textShadow }}
          >
            kr8tiv AI is an open-source, tokenized, collaborative AI company building autonomous
            systems that the world actually needs. We&apos;re proud to be in this race to the bottom &mdash;
            proud to be ushering in a new age of technology where the best products are free, the
            best companies share, and the people who use AI own the upside. We&apos;re just getting
            started. Get in.
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10 pointer-events-auto">
            <a
              href="https://kr8tiv.web.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-black/60 border border-[#d4a853]/30 text-white text-xs tracking-[0.2em] uppercase hover:border-[#d4a853]/60 hover:bg-black/80 transition-all duration-300 backdrop-blur-sm"
            >
              Enter the Ecosystem &rarr;
            </a>
            <a
              href="https://jarvislife.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-black/60 border border-white/20 text-white text-xs tracking-[0.2em] uppercase hover:border-white/40 hover:bg-black/80 transition-all duration-300 backdrop-blur-sm"
            >
              Explore JARVIS &rarr;
            </a>
            <a
              href="mailto:hello@kr8tiv.ai"
              className="px-8 py-3 bg-black/60 border border-white/20 text-white text-xs tracking-[0.2em] uppercase hover:border-white/40 hover:bg-black/80 transition-all duration-300 pointer-events-auto backdrop-blur-sm"
            >
              Custom Solutions &rarr;
            </a>
          </div>

          {/* Social icons */}
          <div className="flex items-center justify-center gap-6 pointer-events-auto mb-12">
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
            Anarcho-capitalist liberation tech. You&apos;re welcome.
          </div>

          <div className="text-[8px] font-mono text-white/30 tracking-[0.3em] uppercase" style={{ textShadow }}>
            &copy; 2026 kr8tiv AI &mdash; All systems nominal
          </div>
        </div>
      </section>
    </div>
  )
}
