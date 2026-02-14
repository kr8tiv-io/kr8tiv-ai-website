import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Mouse-following energy particles — soft glowing orbs that
 * drift between the 3D box and the mouse cursor position.
 * No lines, no strings — just ethereal light particles.
 */

const PARTICLE_COUNT = 12

/** Create a soft radial glow texture */
function createGlowTexture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const center = 32
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center)
  gradient.addColorStop(0, 'rgba(255,255,255,0.5)')
  gradient.addColorStop(0.2, 'rgba(255,255,255,0.2)')
  gradient.addColorStop(0.5, 'rgba(212,168,83,0.06)')
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

export default function MouseTracers() {
  const ref = useRef<THREE.Points>(null)
  const mouseWorld = useRef(new THREE.Vector3(0, 1, 4))
  const _targetMouse = useRef(new THREE.Vector3())

  const texture = useMemo(() => createGlowTexture(), [])

  const { geometry, seeds } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const sd = new Float32Array(PARTICLE_COUNT * 4) // phase, speed, originAngle, progress

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2
      const radius = 0.5 + Math.random() * 0.8
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = 0.3 + Math.random() * 0.4
      positions[i * 3 + 2] = Math.sin(angle) * radius

      sd[i * 4] = Math.random() * Math.PI * 2      // phase
      sd[i * 4 + 1] = 0.15 + Math.random() * 0.25  // speed
      sd[i * 4 + 2] = angle                         // origin angle
      sd[i * 4 + 3] = Math.random()                 // initial progress
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return { geometry: geo, seeds: sd }
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    const { pointer, viewport } = state
    const t = state.clock.elapsedTime

    // Smooth mouse tracking (reuse ref to avoid per-frame allocation)
    _targetMouse.current.set(
      (pointer.x * viewport.width) / 2,
      (pointer.y * viewport.height) / 2 + 1,
      3.5
    )
    mouseWorld.current.lerp(_targetMouse.current, 0.04)

    const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const phase = seeds[i * 4]
      const speed = seeds[i * 4 + 1]
      const originAngle = seeds[i * 4 + 2]

      // Each particle oscillates between box origin and mouse
      const progress = (Math.sin(t * speed + phase) + 1) / 2 // 0 to 1

      // Origin — near the box surface
      const originRadius = 0.6 + Math.sin(t * 0.3 + phase) * 0.2
      const ox = Math.cos(originAngle + t * 0.05) * originRadius
      const oy = 0.3 + Math.sin(t * 0.4 + phase) * 0.15
      const oz = Math.sin(originAngle + t * 0.05) * originRadius

      // Target — toward mouse but not all the way (30% toward mouse)
      const tx = mouseWorld.current.x * 0.3
      const ty = mouseWorld.current.y * 0.3
      const tz = mouseWorld.current.z * 0.2

      // Smooth interpolation with a gentle arc
      const eased = progress * progress * (3 - 2 * progress) // smoothstep
      const arcHeight = Math.sin(eased * Math.PI) * 0.2

      posAttr.setXYZ(
        i,
        ox + (tx - ox) * eased,
        oy + (ty - oy) * eased + arcHeight,
        oz + (tz - oz) * eased
      )
    }

    posAttr.needsUpdate = true
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        map={texture}
        color="#ffffff"
        size={0.18}
        transparent
        opacity={0.1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}
