import { useState, useEffect } from 'react'

export type DeviceTier = 'high' | 'medium' | 'low'

export interface DeviceCapability {
  tier: DeviceTier
  supportsWebGL: boolean
  webglChecked: boolean
}

const LOW_RENDERER_PATTERN = /(Mali|Adreno 5|SwiftShader)/i
const MEDIUM_RENDERER_PATTERN = /(Intel\(R\) UHD|Intel\(R\) Iris|Intel\(R\) HD Graphics)/i

export function useDeviceCapability(): DeviceCapability {
  const [capability, setCapability] = useState<DeviceCapability>({
    tier: 'high',
    supportsWebGL: false,
    webglChecked: false,
  })

  useEffect(() => {
    const detectTier = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isMobile = width < 768

      const detectionCanvas = document.createElement('canvas')
      const detectionGl =
        detectionCanvas.getContext('webgl2') || detectionCanvas.getContext('webgl')
      const renderer = detectionGl
        ? (detectionGl as WebGL2RenderingContext).getParameter(
            (detectionGl as WebGL2RenderingContext).RENDERER
          )
        : ''

      const isLowRenderer = typeof renderer === 'string' && LOW_RENDERER_PATTERN.test(renderer)
      const isMediumRenderer = typeof renderer === 'string' && MEDIUM_RENDERER_PATTERN.test(renderer)

      let tier: DeviceTier = 'high'

      if (isMobile || isLowRenderer) {
        tier = 'low'
      } else if (width < 1100 || height < 700 || isMediumRenderer) {
        tier = 'medium'
      }

      const probeOptions = {
        alpha: false,
        antialias: tier !== 'low',
      }
      const startupCanvas = document.createElement('canvas')
      const startupGl =
        startupCanvas.getContext('webgl2', probeOptions) ||
        startupCanvas.getContext('webgl', probeOptions)
      const supportsWebGL = Boolean(startupGl)

      setCapability({
        tier,
        supportsWebGL,
        webglChecked: true,
      })
    }

    detectTier()
    window.addEventListener('resize', detectTier)

    return () => {
      window.removeEventListener('resize', detectTier)
    }
  }, [])

  return capability
}
