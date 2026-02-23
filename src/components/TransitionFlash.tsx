import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function TransitionFlash() {
  const flashRef = useRef<HTMLDivElement>(null)
  const scannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    const isMobile = window.innerWidth < 768
    if (reduceMotion || isMobile) return

    const sectionEls = document.querySelectorAll('.content-section')
    const triggers: any[] = []

    sectionEls.forEach((el, i) => {
      if (i === 0) return

      const t = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        onEnter: () => {
          // White flash
          if (flashRef.current) {
            gsap.fromTo(
              flashRef.current,
              { opacity: 0 },
              { opacity: 0.03, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.out' }
            )
          }
          // Scanner line
          if (scannerRef.current) {
            gsap.fromTo(
              scannerRef.current,
              { y: -1, opacity: 1 },
              { y: '100vh', opacity: 0, duration: 0.8, ease: 'power1.in' }
            )
          }
        },
      })

      triggers.push(t)
    })

    return () => {
      triggers.forEach(t => t.kill())
    }
  }, [])

  return (
    <>
      <div
        ref={flashRef}
        className="fixed inset-0 bg-white pointer-events-none z-[25] opacity-0"
      />
      <div
        ref={scannerRef}
        className="fixed top-0 left-0 right-0 h-px pointer-events-none z-[15] opacity-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent 100%)',
        }}
      />
    </>
  )
}
