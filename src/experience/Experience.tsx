import { ContactShadows, Environment, Sparkles } from '@react-three/drei'
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
        environmentIntensity={tier === 'high' ? 0.5 : tier === 'medium' ? 0.45 : 0.62}
      />

      {/* Scene fog — pulled in and lifted off pure black so the haze reads. */}
      <fog attach="fog" args={['#070a16', 6, 30]} />

      {/* ── Lighting rig ──────────────────────────────────────────
          A proper key / rim / kick setup instead of flat fill. The rim is what
          draws the machined edges; the key is warm, the rim cool, so the metal
          has two temperatures to reflect. */}
      <ambientLight intensity={0.06} />

      {/* KEY — warm, high and to the right, soft-edged */}
      <spotLight
        position={[4.5, 7.5, 4]}
        angle={0.78}
        penumbra={1}
        intensity={tier === 'low' ? 38 : 32}
        distance={26}
        decay={2}
        color="#ffe2bd"
        castShadow={tier === 'high'}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0006}
      />

      {/* RIM — cool, low and behind: separates the silhouette from the fog */}
      <spotLight
        position={[-5, 2.6, -6]}
        angle={1.05}
        penumbra={1}
        intensity={tier === 'low' ? 28 : 26}
        distance={24}
        decay={2}
        color="#9db8ff"
      />

      {/* KICK — tight amber bounce off the deck, sells the brand colour */}
      <pointLight position={[1.4, 1.1, 1.9]} intensity={2.6} color="#d4a853" distance={7} decay={2} />

      {/* Deep fill so the dark side never goes fully black */}
      <pointLight position={[-4, 1.4, 3]} intensity={1.1} color="#7f8cc0" distance={13} decay={2} />

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

      {/* Contact shadow — the single strongest grounding cue. Rendered at low
          resolution and only where there is budget for it. */}
      {tier !== 'low' && (
        <ContactShadows
          position={[0, -0.255, 0]}
          scale={12}
          resolution={tier === 'high' ? 512 : 256}
          blur={2.6}
          opacity={0.55}
          far={4}
          frames={tier === 'high' ? Infinity : 1}
          color="#000008"
        />
      )}

      <MouseLight />
      <MouseTracers />
      <Ground tier={tier} />

      {/* Phones get a bloom-only pass (see Effects) so the fog reads there too. */}
      <Effects tier={tier} />
    </>
  )
}
