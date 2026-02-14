import { Environment, Sparkles } from '@react-three/drei'
import CameraRig from './CameraRig'
import ProductModel from './ProductModel'
import Ground from './Ground'
import Effects from './Effects'
import HudRing from './HudRing'
import MouseLight from './MouseLight'
import type { DeviceTier } from '../hooks/useDeviceCapability'

interface ExperienceProps {
  tier: DeviceTier
}

export default function Experience({ tier }: ExperienceProps) {
  return (
    <>
      {/* Dark studio HDR — low intensity so reflections are subtle, not bright */}
      <Environment preset="studio" environmentIntensity={0.35} />

      {/* Scene fog — deep, heavy, objects dissolve into darkness */}
      <fog attach="fog" args={['#030308', 5, 22]} />

      {/* Minimal fill — just enough to read the object */}
      <ambientLight intensity={0.06} />
      <directionalLight position={[5, 8, 3]} intensity={0.3} castShadow />
      <spotLight
        position={[-3, 6, -3]}
        angle={0.35}
        penumbra={0.9}
        intensity={0.4}
        color="#ffd4a0"
      />

      {/* Subtle colored accent lights — feel, not illuminate */}
      <pointLight position={[5, 2, 3]} intensity={0.08} color="#ffffff" distance={12} />
      <pointLight position={[-5, 2, -3]} intensity={0.05} color="#ffffff" distance={12} />
      <pointLight position={[0, -1, 5]} intensity={0.08} color="#d4a853" distance={10} />

      {/* Scroll-driven camera */}
      <CameraRig />

      {/* The product — kr8tiv device wrapped in 3D net */}
      <ProductModel />

      {/* Atmospheric field — volumetric fog and mist */}
      <HudRing />

      {/* Golden sparkles — ethereal energy */}
      <Sparkles
        count={80}
        speed={0.2}
        opacity={0.4}
        color="#d4a853"
        size={1.2}
        scale={[3.5, 1.5, 3.5]}
        position={[0, 0.5, 0]}
        noise={[0.5, 0.3, 0.5]}
      />

      {/* Mouse-following light */}
      <MouseLight />

      {/* Dark ground plane */}
      <Ground />

      {/* Post-processing */}
      {tier !== 'low' && <Effects />}
    </>
  )
}
