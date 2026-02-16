import {
  EffectComposer,
  Bloom,
  Vignette,
  N8AO,
  ChromaticAberration,
  ToneMapping,
  Noise,
} from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import type { DeviceTier } from '../hooks/useDeviceCapability'

interface EffectsProps {
  tier?: DeviceTier
}

export default function Effects({ tier = 'high' }: EffectsProps) {
  const isHigh = tier === 'high'

  return (
    <EffectComposer multisampling={isHigh ? 4 : 0}>
      <Bloom
        luminanceThreshold={isHigh ? 0.5 : 0.65}
        luminanceSmoothing={0.7}
        intensity={isHigh ? 0.7 : 0.4}
        mipmapBlur
      />
      {/* N8AO + ChromaticAberration — desktop only (biggest GPU cost in post) */}
      {isHigh && (
        <N8AO
          aoRadius={1.5}
          intensity={2.5}
          distanceFalloff={0.6}
        />
      )}
      {isHigh && (
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0006, 0.0006)}
          radialModulation={true}
          modulationOffset={0.5}
        />
      )}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette darkness={0.65} offset={0.2} />
      <Noise opacity={0.012} />
    </EffectComposer>
  )
}
