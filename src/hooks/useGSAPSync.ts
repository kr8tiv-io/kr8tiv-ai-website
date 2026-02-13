import { useEffect } from 'react'
import { useLenis } from 'lenis/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useGSAPSync() {
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis) return

    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tickerCallback)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.off('scroll', onScroll)
      gsap.ticker.remove(tickerCallback)
    }
  }, [lenis])
}
