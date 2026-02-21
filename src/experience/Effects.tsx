import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  ToneMapping,
} from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import type { DeviceTier } from '../hooks/useDeviceCapability'

interface EffectsProps {
  tier: DeviceTier
}

export default function Effects({ tier }: EffectsProps) {
  const highTier = tier === 'high'

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={highTier ? 0.6 : 0.72}
        luminanceSmoothing={highTier ? 0.7 : 0.78}
        intensity={highTier ? 0.5 : 0.32}
        mipmapBlur
        levels={highTier ? 5 : 4}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(highTier ? 0.0004 : 0.00025, highTier ? 0.0004 : 0.00025)}
        radialModulation={highTier}
        modulationOffset={highTier ? 0.5 : 0.2}
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette darkness={highTier ? 0.7 : 0.55} offset={highTier ? 0.2 : 0.24} />
    </EffectComposer>
  )
}
