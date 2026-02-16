import { Environment, Sparkles } from '@react-three/drei'
import CameraRig from './CameraRig'
import ProductModel from './ProductModel'
import VolumetricSmoke from './VolumetricSmoke'
import SmokeStream from './SmokeStream'
import Ground from './Ground'
import Effects from './Effects'
import HudRing from './HudRing'
import Kr8tivLogo from './Kr8tivLogo'
import MouseLight from './MouseLight'
import MouseTracers from './MouseTracers'
import type { DeviceTier } from '../hooks/useDeviceCapability'

interface ExperienceProps {
  tier: DeviceTier
}

export default function Experience({ tier }: ExperienceProps) {
  const isHigh = tier === 'high'

  return (
    <>
      {/* Dark studio HDR — dimmer on mobile to reduce flashy reflections */}
      <Environment preset="studio" environmentIntensity={isHigh ? 0.35 : 0.2} />

      {/* Scene fog — deep, heavy, objects dissolve into darkness */}
      <fog attach="fog" args={['#030308', 5, 22]} />

      {/* Minimal fill — just enough to read the object */}
      <ambientLight intensity={0.06} />
      <directionalLight position={[5, 8, 3]} intensity={isHigh ? 0.3 : 0.18} castShadow />
      <spotLight
        position={[-3, 6, -3]}
        angle={0.35}
        penumbra={0.9}
        intensity={isHigh ? 0.25 : 0.12}
        color="#ffd4a0"
      />

      {/* Subtle accent lights — feel, not illuminate */}
      <pointLight position={[5, 2, 3]} intensity={0.08} color="#ffffff" distance={12} />
      <pointLight position={[-5, 2, -3]} intensity={0.05} color="#ffffff" distance={12} />

      {/* Scroll-driven camera */}
      <CameraRig />

      {/* The product — kr8tiv device wrapped in 3D net */}
      <ProductModel />

      {/* Logo — floating above the device */}
      <Kr8tivLogo />

      {/* Sweeping smoke stream — long volumetric flow */}
      {tier !== 'low' && <SmokeStream />}

      {/* Raymarched volumetric smoke — flows through the device */}
      {tier !== 'low' && <VolumetricSmoke />}

      {/* Atmospheric field — particle fog and mist */}
      <HudRing />

      {/* Golden sparkles — fewer on mobile */}
      <Sparkles
        count={tier === 'high' ? 60 : 25}
        speed={0.2}
        opacity={0.2}
        color="#d4a853"
        size={0.8}
        scale={[3.5, 1.5, 3.5]}
        position={[0, 0.5, 0]}
        noise={[0.5, 0.3, 0.5]}
      />

      {/* Mouse-following light */}
      <MouseLight />

      {/* Mouse-following tracers from the box — desktop only */}
      {tier === 'high' && <MouseTracers />}

      {/* Dark ground plane */}
      <Ground />

      {/* Post-processing — tier-aware */}
      {tier !== 'low' && <Effects tier={tier} />}
    </>
  )
}
