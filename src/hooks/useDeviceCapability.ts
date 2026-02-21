import { useState, useEffect } from 'react'

export type DeviceTier = 'high' | 'medium' | 'low'

export function useDeviceCapability(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>('high')

  useEffect(() => {
    const detectTier = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isMobile = width < 768
      const isCompactDesktop = width < 1400 || height < 860
      const isFirefox = /firefox/i.test(window.navigator.userAgent)

      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      const renderer = gl
        ? (gl as WebGL2RenderingContext).getParameter(
            (gl as WebGL2RenderingContext).RENDERER
          )
        : ''

      const weakRenderer =
        typeof renderer === 'string' &&
        /(Mali|Adreno 5|Intel\(R\) HD Graphics|SwiftShader)/i.test(renderer)

      if (isMobile || weakRenderer) {
        setTier('low')
        return
      }

      if (isFirefox || isCompactDesktop) {
        setTier('medium')
        return
      }

      setTier('high')
    }

    detectTier()
    window.addEventListener('resize', detectTier)

    return () => {
      window.removeEventListener('resize', detectTier)
    }
  }, [])

  return tier
}
