import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * 3D HUD ring that orbits around the product model.
 * Thin holographic ring with tick marks and data point indicators.
 */
export default function HudRing() {
  const ringGroupRef = useRef<THREE.Group>(null)
  const innerRingRef = useRef<THREE.Mesh>(null)
  const outerRingRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // Slow counter-rotation for the HUD ring
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.y = t * 0.1
    }
    // Inner ring spins opposite direction
    if (innerRingRef.current) {
      innerRingRef.current.rotation.y = -t * 0.15
    }
    // Outer ring pulses
    if (outerRingRef.current) {
      const mat = outerRingRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.15 + Math.sin(t * 1.5) * 0.05
    }
  })

  // Create tick marks around the ring
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const angle = (i / 36) * Math.PI * 2
    const isLong = i % 9 === 0
    const length = isLong ? 0.15 : 0.07
    const x = Math.cos(angle) * 2.8
    const z = Math.sin(angle) * 2.8
    return { angle, x, z, length, isLong }
  })

  // Data point indicators at 4 cardinal positions
  const dataPoints = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => {
    const colors = ['#00e5ff', '#ff6b35', '#a855f7', '#d4a853']
    return {
      x: Math.cos(angle) * 2.95,
      z: Math.sin(angle) * 2.95,
      color: colors[i],
    }
  })

  return (
    <group ref={ringGroupRef} position={[0, 0.3, 0]}>
      {/* Main HUD ring */}
      <mesh ref={innerRingRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.75, 2.8, 64]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={0.6}
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Outer ring — wider, dimmer */}
      <mesh ref={outerRingRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.0, 3.05, 64]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={0.3}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Tick marks */}
      {ticks.map((tick, i) => (
        <mesh
          key={i}
          position={[tick.x, 0, tick.z]}
          rotation={[0, -tick.angle + Math.PI / 2, 0]}
        >
          <boxGeometry args={[tick.length, 0.01, 0.005]} />
          <meshStandardMaterial
            color="#00e5ff"
            emissive="#00e5ff"
            emissiveIntensity={tick.isLong ? 0.8 : 0.3}
            transparent
            opacity={tick.isLong ? 0.6 : 0.25}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Data point spheres at cardinal positions */}
      {dataPoints.map((dp, i) => (
        <mesh key={`dp-${i}`} position={[dp.x, 0, dp.z]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial
            color={dp.color}
            emissive={dp.color}
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}
