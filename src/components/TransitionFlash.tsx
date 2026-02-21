import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function TransitionFlash() {
  const scannerRef = useRef<HTMLDivElement>(null)
  const triggerRefs = useRef<ScrollTrigger[]>([])
  const lastTriggerAt = useRef(new WeakMap<Element, number>())

  useEffect(() => {
    const sectionEls = document.querySelectorAll('.content-section')

    const triggerScanner = (el: Element) => {
      const now = Date.now()
      const last = lastTriggerAt.current.get(el) ?? 0
      if (now - last < 900) {
        return
      }
      lastTriggerAt.current.set(el, now)

      if (!scannerRef.current) {
        return
      }

      gsap.killTweensOf(scannerRef.current)
      gsap.set(scannerRef.current, { top: '-10vh', opacity: 0 })
      gsap.to(scannerRef.current, {
        top: '105vh',
        opacity: 0.18,
        duration: 1.25,
        ease: 'sine.inOut',
      })
      gsap.to(scannerRef.current, {
        opacity: 0,
        duration: 0.75,
        ease: 'power2.out',
        delay: 0.5,
      })
    }

    sectionEls.forEach((el, i) => {
      if (i === 0) return

      const trigger = ScrollTrigger.create({
        trigger: el,
        start: 'top 45%',
        onEnter: () => triggerScanner(el),
        onEnterBack: () => triggerScanner(el),
      })
      triggerRefs.current.push(trigger)
    })

    return () => {
      triggerRefs.current.forEach((trigger) => trigger.kill())
      triggerRefs.current = []
      lastTriggerAt.current = new WeakMap<Element, number>()
    }
  }, [])

  return (
    <div
      ref={scannerRef}
      data-testid="transition-scanner"
      className="fixed left-0 right-0 h-[2px] pointer-events-none z-[15] opacity-0"
      style={{
        background:
          'linear-gradient(90deg, transparent 0%, rgba(212,168,83,0.16) 25%, rgba(255,255,255,0.12) 50%, rgba(212,168,83,0.16) 75%, transparent 100%)',
        boxShadow: '0 0 20px rgba(212,168,83,0.14)',
      }}
    />
  )
}
