import type { ReactElement } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  ToneMapping,
  FXAA,
} from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import type { DeviceTier } from '../hooks/useDeviceCapability'

/**
 * Effects — Optimized post-processing stack.
 *
 * The composer renders the scene into its own target, so the canvas
 * `antialias` flag does not smooth geometry once this pass is mounted.
 * Multisampling here is the MSAA that actually reaches the picture.
 * Firefox keeps samples at 0 (conservative context) and gets an FXAA pass
 * instead, which is what takes the stair-steps off that path.
 */

// Scroll-velocity-reactive chromatic aberration offset.
// Passed by reference — mutating in useFrame updates the effect directly.
// (refs on postprocessing wrappers crash JSON.stringify in React 19)
const _offsetVec = new THREE.Vector2(0.00015, 0.00015)
const _targetOffset = new THREE.Vector2(0.00015, 0.00015)

interface EffectsProps {
  tier: DeviceTier
}

export default function Effects({ tier }: EffectsProps) {
  const highTier = tier === 'high'
  const lowTier = tier === 'low'
  const gl = useThree((s) => s.gl)
  const conservative =
    typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent)

  // Phones get bloom ONLY — it is what makes the additive haze read as light
  // rather than a grey wash — and only on a WebGL2 context, so we never push
  // a post pipeline onto an old WebGL1 mobile driver.
  const leanPost = lowTier && gl.capabilities.isWebGL2
  const maxSamples = gl.capabilities.isWebGL2 ? gl.capabilities.maxSamples || 0 : 0
  const wantedSamples = conservative ? 0 : lowTier ? 2 : highTier ? 4 : 2
  const samples = Math.min(wantedSamples, maxSamples)

  useFrame(() => {
    const vel = Math.min(Math.abs((window as any).__kr8tiv_scrollVel ?? 0), 1500)
    const normalized = vel / 1500
    const baseOffset = highTier ? 0.0004 : 0.00025
    const velocityOffset = highTier ? 0.0002 : 0.00012

    _targetOffset.set(
      baseOffset + normalized * velocityOffset,
      baseOffset + normalized * velocityOffset
    )
    _offsetVec.lerp(_targetOffset, 0.12)
  })

  if (lowTier) {
    if (!leanPost) return null
    const lean: ReactElement[] = [
      <Bloom
        key="bloom"
        luminanceThreshold={0.68}
        luminanceSmoothing={0.8}
        intensity={0.42}
        mipmapBlur
        levels={3}
      />,
      <ToneMapping key="tone" mode={ToneMappingMode.ACES_FILMIC} />,
    ]
    if (samples === 0) lean.push(<FXAA key="fxaa" />)
    return <EffectComposer multisampling={samples}>{lean}</EffectComposer>
  }

  const passes: ReactElement[] = [
    <Bloom
      key="bloom"
      luminanceThreshold={highTier ? 0.74 : 0.8}
      luminanceSmoothing={highTier ? 0.72 : 0.8}
      intensity={highTier ? 0.42 : 0.28}
      mipmapBlur
      levels={highTier ? 5 : 4}
    />,
    <ChromaticAberration
      key="chroma"
      blendFunction={BlendFunction.NORMAL}
      offset={_offsetVec}
      radialModulation={highTier}
      modulationOffset={highTier ? 0.5 : 0.2}
    />,
    <ToneMapping key="tone" mode={ToneMappingMode.ACES_FILMIC} />,
    <Vignette key="vignette" darkness={highTier ? 0.7 : 0.55} offset={highTier ? 0.2 : 0.24} />,
  ]
  if (samples === 0) passes.push(<FXAA key="fxaa" />)

  return <EffectComposer multisampling={samples}>{passes}</EffectComposer>
}
