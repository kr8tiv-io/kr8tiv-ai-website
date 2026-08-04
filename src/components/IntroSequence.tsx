import { useRef, useEffect } from 'react'
import gsap from 'gsap'

interface IntroSequenceProps {
  onComplete: () => void
  startAnimation?: boolean
}

export default function IntroSequence({ onComplete, startAnimation = true }: IntroSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  // Build timeline once, but pause it until startAnimation is true
  useEffect(() => {
    if (!containerRef.current || !titleRef.current || !taglineRef.current) return

    const tl = gsap.timeline({
      paused: !startAnimation,
      onComplete: () => {
        if (containerRef.current) {
          containerRef.current.style.display = 'none'
        }
        window.dispatchEvent(new CustomEvent('intro-complete'))
        onComplete()
      },
    })
    tlRef.current = tl

    // The whole beat is kept under ~2.6s: the loading screen already showed the
    // wordmark, so a longer curtain is just dead time before the hero.
    // Phase 1: "kr8tiv" fades in
    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      0.15
    )

    // Phase 2: Tagline fades in
    tl.fromTo(
      taglineRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      0.7
    )

    // Phase 3: Everything fades out
    tl.to(
      [titleRef.current, taglineRef.current],
      { opacity: 0, duration: 0.6, ease: 'power2.in' },
      1.65
    )
    tl.to(
      containerRef.current,
      { opacity: 0, duration: 0.8, ease: 'power2.inOut' },
      1.8
    )

    return () => {
      tl.kill()
      tlRef.current = null
    }
  }, [onComplete])

  // Play the timeline when startAnimation becomes true
  useEffect(() => {
    if (startAnimation && tlRef.current && tlRef.current.paused()) {
      tlRef.current.play()
    }
  }, [startAnimation])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-[#050510]"
    >
      <h1
        ref={titleRef}
        className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-[-0.03em] text-white opacity-0"
        style={{ fontFamily: "'Syne', system-ui, sans-serif" }}
      >
        kr8tiv
      </h1>
      <p
        ref={taglineRef}
        className="mt-6 text-sm sm:text-base text-white/40 max-w-lg text-center leading-relaxed px-4 opacity-0"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        We build AI back-offices. The paperwork does itself now.
      </p>
    </div>
  )
}
