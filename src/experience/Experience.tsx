import { Environment } from '@react-three/drei'
import CameraRig from './CameraRig'
import ProductModel from './ProductModel'
import Ground from './Ground'
import Effects from './Effects'
import HudRing from './HudRing'
import type { DeviceTier } from '../hooks/useDeviceCapability'

interface ExperienceProps {
  tier: DeviceTier
}

export default function Experience({ tier }: ExperienceProps) {
  return (
    <>
      {/* Studio HDR lighting — the most important element for photorealism */}
      <Environment preset="studio" environmentIntensity={1.0} />

      {/* Fill lights */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 8, 3]} intensity={0.4} castShadow />
      <spotLight
        position={[-3, 5, -3]}
        angle={0.4}
        penumbra={0.8}
        intensity={0.6}
        color="#ffd4a0"
      />

      {/* Accent rim lights for HUD glow */}
      <pointLight position={[3, 1, 0]} intensity={0.3} color="#00e5ff" distance={8} />
      <pointLight position={[-3, 1, 0]} intensity={0.2} color="#a855f7" distance={8} />

      {/* Scroll-driven camera */}
      <CameraRig />

      {/* The product */}
      <ProductModel />

      {/* 3D HUD ring around product */}
      <HudRing />

      {/* Reflective ground */}
      <Ground />

      {/* Post-processing */}
      {tier !== 'low' && <Effects />}
    </>
  )
}
