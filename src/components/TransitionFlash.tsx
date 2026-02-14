import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function TransitionFlash() {
  const flashRef = useRef<HTMLDivElement>(null)
  const scannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sectionEls = document.querySelectorAll('.content-section')

    sectionEls.forEach((el, i) => {
      if (i === 0) return

      ScrollTrigger.create({
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
              { top: '-1px', opacity: 1 },
              { top: '100vh', opacity: 0, duration: 0.8, ease: 'power1.in' }
            )
          }
        },
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill())
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
        className="fixed left-0 right-0 h-px pointer-events-none z-[15] opacity-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent 100%)',
        }}
      />
    </>
  )
}
