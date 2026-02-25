/**
 * Ground — nearly invisible void floor.
 * Ultra-dark with barely-there reflection. No visible pattern.
 * The ground should feel like you're floating over a dark abyss.
 */
import type { DeviceTier } from '../hooks/useDeviceCapability'

interface GroundProps {
  tier: DeviceTier
}

export default function Ground({ tier }: GroundProps) {
  const isLow = tier === 'low'
  const isMedium = tier === 'medium'

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial
        color="#010104"
        metalness={isLow ? 0.4 : isMedium ? 0.65 : 0.9}
        roughness={isLow ? 0.82 : isMedium ? 0.45 : 0.15}
        envMapIntensity={isLow ? 0.015 : isMedium ? 0.03 : 0.05}
      />
    </mesh>
  )
}
