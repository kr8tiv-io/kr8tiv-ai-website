import { useState, useEffect } from 'react'

export type DeviceTier = 'high' | 'medium' | 'low'

const LOW_RENDERER_PATTERN = /(Mali|Adreno 5|SwiftShader)/i
const MEDIUM_RENDERER_PATTERN = /(Intel\(R\) UHD|Intel\(R\) Iris|Intel\(R\) HD Graphics)/i

export function useDeviceCapability(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>('high')

  useEffect(() => {
    const detectTier = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isMobile = width < 768

      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      const renderer = gl
        ? (gl as WebGL2RenderingContext).getParameter(
            (gl as WebGL2RenderingContext).RENDERER
          )
        : ''

      const isLowRenderer = typeof renderer === 'string' && LOW_RENDERER_PATTERN.test(renderer)
      const isMediumRenderer = typeof renderer === 'string' && MEDIUM_RENDERER_PATTERN.test(renderer)

      if (isMobile || isLowRenderer) {
        setTier('low')
        return
      }

      if (width < 1100 || height < 700 || isMediumRenderer) {
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
