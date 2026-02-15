import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────
   Kr8tiv Logo — Floating SVG Logo Above Device

   Loads the kr8tiv brand mark as a grayscale-to-alpha texture
   on a glowing plane. Warm golden emissive glow pulses gently.
   Designed to emerge from the volumetric smoke like an ethereal
   brand hologram.
   ──────────────────────────────────────────────────────────── */

// Logo positioning — centered above the device
const LOGO_Y = 2.2
const FLOAT_AMPLITUDE = 0.06
const FLOAT_SPEED = 0.4

// The PNG is 4382x1460 → aspect ratio 3:1
const LOGO_WIDTH = 3.2
const LOGO_HEIGHT = LOGO_WIDTH / 3

export default function Kr8tivLogo() {
  const groupRef = useRef<THREE.Group>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)

  // Load the grayscale PNG — used as alphaMap (light = visible, dark = transparent)
  const logoTexture = useTexture('/images/kr8tiv-logo.png')

  // Configure texture for alpha mapping
  useMemo(() => {
    logoTexture.minFilter = THREE.LinearFilter
    logoTexture.magFilter = THREE.LinearFilter
    logoTexture.generateMipmaps = false
  }, [logoTexture])

  // Pure white glow
  const emissiveColor = useMemo(() => new THREE.Color('#ffffff'), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // Gentle floating bob
    if (groupRef.current) {
      groupRef.current.position.y = LOGO_Y + Math.sin(t * FLOAT_SPEED) * FLOAT_AMPLITUDE
      // Extremely subtle rotation breathing
      groupRef.current.rotation.y = Math.sin(t * 0.15) * 0.02
    }

    // Solid white with subtle brightness pulse
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 2.0 + Math.sin(t * 0.8) * 0.15
    }
  })

  return (
    <group ref={groupRef} position={[0, LOGO_Y, 0]}>
      <mesh>
        <planeGeometry args={[LOGO_WIDTH, LOGO_HEIGHT]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#ffffff"
          emissive={emissiveColor}
          emissiveIntensity={2.0}
          alphaMap={logoTexture}
          alphaTest={0.1}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
