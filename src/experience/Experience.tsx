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
  return (
    <>
      {/* Local HDR avoids cross-origin fetch failures in Firefox/WebGL context churn. */}
      <Environment
        files="/hdr/studio_small_03_1k.hdr"
        environmentIntensity={tier === 'high' ? 0.3 : 0.22}
      />

      {/* Scene fog - deep, heavy, objects dissolve into darkness. */}
      <fog attach="fog" args={['#030308', 5, 22]} />

      {/* Minimal fill - just enough to read the object. */}
      <ambientLight intensity={0.05} />
      <directionalLight position={[5, 8, 3]} intensity={0.25} castShadow />
      <spotLight
        position={[-3, 6, -3]}
        angle={0.35}
        penumbra={0.9}
        intensity={0.25}
        color="#ffd4a0"
      />

      {/* Subtle accent lights - feel, not illuminate. */}
      <pointLight position={[5, 2, 3]} intensity={0.06} color="#ffffff" distance={12} />
      <pointLight position={[-5, 2, -3]} intensity={0.04} color="#ffffff" distance={12} />

      <CameraRig />
      <ProductModel tier={tier} />
      <Kr8tivLogo />

      {tier !== 'low' && <SmokeStream />}
      {tier === 'high' && <VolumetricSmoke />}

      <HudRing />

      <Sparkles
        count={60}
        speed={0.2}
        opacity={0.15}
        color="#d4a853"
        size={0.6}
        scale={[3.5, 1.5, 3.5]}
        position={[0, 0.5, 0]}
        noise={[0.5, 0.3, 0.5]}
      />

      <MouseLight />
      <MouseTracers />
      <Ground />

      {tier !== 'low' && <Effects tier={tier} />}
    </>
  )
}
