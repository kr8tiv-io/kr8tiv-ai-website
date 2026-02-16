import { useState, useEffect } from 'react'

export type DeviceTier = 'high' | 'medium' | 'low'

export function useDeviceCapability(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>('high')

  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    const renderer = gl
      ? (gl as WebGL2RenderingContext).getParameter(
          (gl as WebGL2RenderingContext).RENDERER
        )
      : ''

    // Release the sniffing GL context to prevent leak
    if (gl) {
      const ext = (gl as WebGL2RenderingContext).getExtension('WEBGL_lose_context')
      ext?.loseContext()
    }

    // Only weak GPUs get 'low' — mobile with decent GPUs can handle smoke
    if (
      typeof renderer === 'string' &&
      (renderer.includes('Mali') || renderer.includes('Adreno 5'))
    ) {
      setTier('low')
    } else if (isMobile || window.innerWidth < 1200) {
      setTier('medium')
    }
  }, [])

  return tier
}
