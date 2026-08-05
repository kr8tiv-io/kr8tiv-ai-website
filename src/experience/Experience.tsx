import { Environment, Sparkles } from '@react-three/drei'
import CameraRig from './CameraRig'
import OpsMachine from './OpsMachine'
import Atmosphere from './Atmosphere'
import SmokeStream from './SmokeStream'
import Ground from './Ground'
import Effects from './Effects'
import HudRing from './HudRing'
import Kr8tivLogo from './Kr8tivLogo'
import MouseLight from './MouseLight'
import MouseTracers from './MouseTracers'
import type { DeviceTier } from '../hooks/useDeviceCapability'
import { asset } from '../lib/asset'

interface ExperienceProps {
  tier: DeviceTier
}

export default function Experience({ tier }: ExperienceProps) {
  // Atmosphere now carries the fog, so the old stacked-plane stream is only a
  // light accent — and the raymarched VolumetricSmoke is retired entirely: it
  // cost more than everything else combined and you could not see it.
  const smokeProfile =
    tier === 'high'
      ? { stream: { layerCount: 10, opacityMultiplier: 1.5, centerFloor: 0.3 as const } }
      : tier === 'medium'
        ? { stream: { layerCount: 8, opacityMultiplier: 1.5, centerFloor: 0.28 as const } }
        : { stream: { layerCount: 6, opacityMultiplier: 1.8, centerFloor: 0.3 as const } }

  return (
    <>
      {/* Local HDR avoids cross-origin fetch failures in Firefox/WebGL context churn. */}
      <Environment
        files={asset('/hdr/studio_small_03_1k.hdr')}
        environmentIntensity={tier === 'high' ? 0.3 : 0.22}
      />

      {/* Scene fog — pulled in and lifted off pure black so the haze reads. */}
      <fog attach="fog" args={['#070a16', 6, 30]} />

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
      <OpsMachine tier={tier} />
      {/* Wordmark on the piece: hologram above the deck + livery etched on it.
          On every tier now — phones get the compact mark. */}
      <Kr8tivLogo compact={tier === 'low'} />

      {/* Atmosphere runs everywhere, including phones — fewer layers, same look. */}
      <Atmosphere tier={tier} />
      <SmokeStream {...smokeProfile.stream} />

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
      <Ground tier={tier} />

      {/* Phones get a bloom-only pass (see Effects) so the fog reads there too. */}
      <Effects tier={tier} />
    </>
  )
}
