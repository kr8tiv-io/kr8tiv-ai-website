import { useState, useEffect } from 'react'

export type DeviceTier = 'high' | 'medium' | 'low'

export interface DeviceCapability {
  tier: DeviceTier
  preferConservativeWebGL: boolean
  supportsWebGL: boolean
  webglChecked: boolean
}

const LOW_RENDERER_PATTERN = /(Mali|Adreno 5|SwiftShader)/i
// Safari (and iPadOS in desktop mode) masks the GPU as "Apple GPU" — treat it
// as medium so iPads never get the full desktop pipeline.
const MEDIUM_RENDERER_PATTERN =
  /(Intel\(R\) UHD|Intel\(R\) Iris|Intel\(R\) HD Graphics|Apple GPU)/i
const FIREFOX_PATTERN = /firefox/i

/** Viewport width alone is enough to know we are on a phone, and it is known
 *  synchronously. Starting at 'high' and downgrading in an effect meant phones
 *  rendered the desktop path — including the full-screen loading curtain — for
 *  a frame or two before being corrected, which delayed the hero paint. */
function initialTier(): DeviceTier {
  if (typeof window === 'undefined') return 'high'
  return window.innerWidth < 768 ? 'low' : 'high'
}

export function useDeviceCapability(): DeviceCapability {
  const [capability, setCapability] = useState<DeviceCapability>(() => ({
    tier: initialTier(),
    preferConservativeWebGL: false,
    supportsWebGL: false,
    webglChecked: false,
  }))

  useEffect(() => {
    const detectTier = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isMobile = width < 768
      const userAgent = window.navigator.userAgent
      // Firefox's WebGL compositing path benefits from the conservative
      // context on every OS, not just Windows.
      const isFirefox = FIREFOX_PATTERN.test(userAgent)
      // iPadOS 13+ reports "Macintosh" but is the only "Mac" with touch.
      const isIPadOS =
        /Macintosh/.test(userAgent) && window.navigator.maxTouchPoints > 1

      let tier: DeviceTier = 'high'

      if (isMobile) {
        tier = 'low'
      } else if (isIPadOS || width < 1100 || height < 700) {
        tier = 'medium'
      }

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

      if (isLowRenderer) {
        tier = 'low'
      } else if (
        tier !== 'low' &&
        (isFirefox || isIPadOS || width < 1100 || height < 700 || isMediumRenderer)
      ) {
        tier = 'medium'
      }

      const probeOptions = {
        alpha: false,
        antialias: tier === 'high' && !isFirefox,
      }
      const startupCanvas = document.createElement('canvas')
      const startupGl =
        startupCanvas.getContext('webgl2', probeOptions) ||
        startupCanvas.getContext('webgl', probeOptions)
      const supportsWebGL = Boolean(startupGl)

      setCapability({
        tier,
        preferConservativeWebGL: isFirefox,
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
