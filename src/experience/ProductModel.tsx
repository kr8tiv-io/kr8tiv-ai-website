import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Placeholder JARVIS device model.
 * Wide, low, boxy shape with dark metallic body, glass top, and amber edge glow.
 * Replace with useGLTF when real GLB model is available.
 */
export default function ProductModel() {
  const groupRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  // Subtle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.03
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.02
    }
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3
    }
  })

  return (
    <group ref={groupRef} position={[0, 0.3, 0]}>
      {/* Main body — dark metallic slab */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.5, 1.6]} />
        <meshStandardMaterial
          color="#0a0a12"
          metalness={0.92}
          roughness={0.12}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Glass top surface */}
      <mesh position={[0, 0.26, 0]}>
        <boxGeometry args={[2.3, 0.02, 1.5]} />
        <meshPhysicalMaterial
          color="#0d1117"
          metalness={0.1}
          roughness={0.05}
          transmission={0.6}
          thickness={0.5}
          ior={1.5}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* Amber edge light strip — front */}
      <mesh ref={glowRef} position={[0, 0, 0.81]}>
        <boxGeometry args={[2.2, 0.06, 0.02]} />
        <meshStandardMaterial
          color="#d4a853"
          emissive="#d4a853"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>

      {/* Amber edge light strip — back */}
      <mesh position={[0, 0, -0.81]}>
        <boxGeometry args={[2.2, 0.06, 0.02]} />
        <meshStandardMaterial
          color="#d4a853"
          emissive="#d4a853"
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>

      {/* Side accent lights */}
      <mesh position={[1.21, 0, 0]}>
        <boxGeometry args={[0.02, 0.06, 1.4]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-1.21, 0, 0]}>
        <boxGeometry args={[0.02, 0.06, 1.4]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>

      {/* Top display indicator — small glowing dot */}
      <mesh position={[0, 0.28, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>

      {/* Subtle base shadow catcher */}
      <mesh position={[0, -0.26, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.8, 2]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </group>
  )
}
