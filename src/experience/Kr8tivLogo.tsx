import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────
   Kr8tiv Logo — Floating Brand Mark Above Device

   Uses drei's <Html> to render the logo as a real DOM element
   positioned in 3D space. This bypasses all Three.js texture/
   material/fog issues — it's just an <img> tag.
   ──────────────────────────────────────────────────────────── */

const LOGO_Y = 1.2
const FLOAT_AMPLITUDE = 0.04
const FLOAT_SPEED = 0.4

export default function Kr8tivLogo() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.position.y = LOGO_Y + Math.sin(t * FLOAT_SPEED) * FLOAT_AMPLITUDE
    }
  })

  return (
    <group ref={groupRef} position={[0, LOGO_Y, 0]}>
      <Html center transform occlude={false} style={{ pointerEvents: 'none' }}>
        <img
          src="/images/kr8tiv-logo.png"
          alt="kr8tiv"
          style={{
            width: '280px',
            height: 'auto',
            opacity: 0.95,
            filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
          draggable={false}
        />
      </Html>
    </group>
  )
}
