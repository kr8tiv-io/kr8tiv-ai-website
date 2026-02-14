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

export default function Effects() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom
        luminanceThreshold={0.3}
        luminanceSmoothing={0.9}
        intensity={1.4}
        mipmapBlur
      />
      <N8AO
        aoRadius={1.5}
        intensity={2.5}
        distanceFalloff={0.6}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.0006, 0.0006)}
        radialModulation={true}
        modulationOffset={0.5}
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette darkness={0.65} offset={0.2} />
      <Noise opacity={0.012} />
    </EffectComposer>
  )
}
