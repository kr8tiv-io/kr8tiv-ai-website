import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────
   Kr8tiv Logo — Floating Brand Mark Above Device

   Renders as a sprite with the PNG texture. The sprite always
   faces the camera. fog=false so it's immune to scene fog.
   ──────────────────────────────────────────────────────────── */

const LOGO_Y = 1.2
const FLOAT_AMPLITUDE = 0.04
const FLOAT_SPEED = 0.4

// Logo is 800×300 → aspect ratio ~2.67:1
const LOGO_WIDTH = 2.8
const LOGO_HEIGHT = LOGO_WIDTH / 2.67

export default function Kr8tivLogo() {
  const groupRef = useRef<THREE.Group>(null)
  const matRef = useRef<THREE.SpriteMaterial>(null)

  const logoTexture = useTexture('/images/kr8tiv-logo.png')

  useMemo(() => {
    logoTexture.minFilter = THREE.LinearFilter
    logoTexture.magFilter = THREE.LinearFilter
    logoTexture.generateMipmaps = false
    logoTexture.colorSpace = THREE.SRGBColorSpace
    logoTexture.needsUpdate = true
  }, [logoTexture])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.position.y = LOGO_Y + Math.sin(t * FLOAT_SPEED) * FLOAT_AMPLITUDE
    }
    if (matRef.current) {
      matRef.current.opacity = 0.9 + Math.sin(t * 0.8) * 0.1
    }
  })

  return (
    <group ref={groupRef} position={[0, LOGO_Y, 0]}>
      <sprite scale={[LOGO_WIDTH, LOGO_HEIGHT, 1]} renderOrder={10}>
        <spriteMaterial
          ref={matRef}
          map={logoTexture}
          transparent
          alphaTest={0.02}
          depthWrite={false}
          toneMapped={false}
          fog={false}
        />
      </sprite>
    </group>
  )
}
