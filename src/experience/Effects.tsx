import { EffectComposer, Bloom, Vignette, N8AO } from '@react-three/postprocessing'

export default function Effects() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom
        luminanceThreshold={1.1}
        luminanceSmoothing={0.4}
        intensity={0.5}
        mipmapBlur
      />
      <N8AO
        aoRadius={0.8}
        intensity={1.5}
        distanceFalloff={0.5}
      />
      <Vignette darkness={0.35} offset={0.3} />
    </EffectComposer>
  )
}
