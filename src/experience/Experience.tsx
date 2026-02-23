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

/* ─────────────────────────────────────────────────────────────
   Experience v3

   Changes from v2:
   - SmokeTrails (10 thin ribbons) → SmokeStream (1 thick volume
     made from 18 stacked layers). More like the reference image.
   - Kr8tivLogo rebuilt with bulletproof meshBasicMaterial approach
     (v2 shader was silently failing). renderOrder=10 ensures
     it's always visible on top of smoke.
   - Ground: dark mirror surface with barely-visible grid that
     only reveals on mouse hover. Much cleaner.
   - Sparkles: white only (no gold on ground per feedback)
   ──────────────────────────────────────────────────────────── */

interface ExperienceProps {
  tier: DeviceTier
}

export default function Experience({ tier }: ExperienceProps) {
  return (
    <>
      <Environment preset="studio" environmentIntensity={0.35} />
      <fog attach="fog" args={['#030308', 5, 22]} />

      {/* Lighting */}
      <ambientLight intensity={0.06} />
      <directionalLight position={[5, 8, 3]} intensity={0.3} castShadow />
      <spotLight
        position={[-3, 6, -3]}
        angle={0.35}
        penumbra={0.9}
        intensity={0.25}
        color="#ffd4a0"
      />
      <pointLight position={[5, 2, 3]} intensity={0.08} color="#ffffff" distance={12} />
      <pointLight position={[-5, 2, -3]} intensity={0.05} color="#eeeeff" distance={12} />

      {/* Camera */}
      <CameraRig />

      {/* ═══ PRODUCT ═══ */}
      <ProductModel />

      {/* ═══ LOGO — above the box ═══ */}
      <Kr8tivLogo />

      {/* ═══ SMOKE STREAM — one thick volumetric flow ═══ */}
      {tier !== 'low' && <SmokeStream />}

      {/* ═══ VOLUMETRIC SMOKE — raymarched fog around the box ═══ */}
      {tier !== 'low' && <VolumetricSmoke />}

      {/* ═══ PARTICLES — GPU-animated ═══ */}
      <HudRing />

      {/* Sparkles — white */}
      <Sparkles
        count={100}
        speed={0.2}
        opacity={0.2}
        color="#ffffff"
        size={0.6}
        scale={[4, 2, 4]}
        position={[0, 0.5, 0]}
        noise={[0.5, 0.3, 0.5]}
      />
      {tier !== 'low' && (
        <Sparkles
          count={60}
          speed={0.4}
          opacity={0.08}
          color="#ffffff"
          size={0.25}
          scale={[6, 3, 6]}
          position={[0, 0.3, 0]}
          noise={[1, 0.5, 1]}
        />
      )}

      {/* Mouse interactions */}
      <MouseLight />
      <MouseTracers />

      {/* ═══ GROUND — dark mirror ═══ */}
      <Ground />

      {/* ═══ POST-PROCESSING ═══ */}
      {tier !== 'low' && <Effects />}
    </>
  )
}
