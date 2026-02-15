import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  ToneMapping,
} from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'

/**
 * Post-processing — optimized.
 *
 * Removed:
 *   - N8AO (expensive, barely visible in dark scene)
 *   - multisampling 4→0 (redundant with post-processing)
 *   - Noise (0.012 opacity = invisible)
 *
 * Tamed:
 *   - Bloom intensity 0.7→0.5, threshold 0.5→0.6
 *     (this is the main fix for the bright blowout)
 *   - Stronger vignette to darken edges and frame the scene
 */
export default function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={0.6}
        luminanceSmoothing={0.7}
        intensity={0.5}
        mipmapBlur
        levels={5}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.0004, 0.0004)}
        radialModulation={true}
        modulationOffset={0.5}
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette darkness={0.7} offset={0.2} />
    </EffectComposer>
  )
}
