import { useEffect } from 'react'

/**
 * Tracks Lenis scroll velocity and exposes it to the 3D scene.
 * The 3D canvas runs in a separate React tree from the HTML overlay,
 * so we use a lightweight window global to bridge them.
 *
 * Effects.tsx reads `window.__kr8tiv_scrollVel` for chromatic aberration.
 * VolumetricSmoke reads it for turbulence modulation.
 */
export function useScrollVelocity() {
  useEffect(() => {
    let lastY = window.scrollY
    let velocity = 0
    let rafId: number

    const tick = () => {
      const currentY = window.scrollY
      velocity = currentY - lastY
      lastY = currentY
      ;(window as any).__kr8tiv_scrollVel = velocity
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(rafId)
  }, [])
}
