import {
  EffectComposer,
  Bloom,
  Vignette,
  N8AO,
  ChromaticAberration,
  ToneMapping,
} from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'

export default function Effects() {
  return (
    <EffectComposer multisampling={4}>
      {/* Bloom — generous, softens everything, makes lights ethereal */}
      <Bloom
        luminanceThreshold={0.4}
        luminanceSmoothing={0.8}
        intensity={1.2}
        mipmapBlur
      />

      {/* Ambient Occlusion — deep shadows for dimension */}
      <N8AO
        aoRadius={1.5}
        intensity={2.5}
        distanceFalloff={0.6}
      />

      {/* Chromatic aberration — subtle prismatic fringing */}
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.0006, 0.0006)}
        radialModulation={true}
        modulationOffset={0.5}
      />

      {/* Tone mapping — cinematic color grading */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />

      {/* Heavy vignette — cinematic darkness at the edges */}
      <Vignette darkness={0.65} offset={0.2} />
    </EffectComposer>
  )
}
