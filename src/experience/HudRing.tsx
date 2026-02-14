import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Atmospheric field — soft volumetric particles only.
 * No cheap dots, no colored lines. Just ethereal smoke/fog
 * that drifts through the scene like a living atmosphere.
 *
 * Uses canvas-generated soft circle textures so particles
 * look like soft orbs, not square pixels.
 */

const FOG_COUNT = 400
const MIST_COUNT = 80

/** Create a soft radial gradient circle texture via Canvas2D */
function createSoftCircleTexture(
  size: number,
  color: string,
  falloff: number = 2
): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const center = size / 2
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center)
  gradient.addColorStop(0, color)
  gradient.addColorStop(0.3 / falloff, color)
  gradient.addColorStop(0.6, 'rgba(0,0,0,0.02)')
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

/**
 * Deep volumetric fog — large, soft, slowly drifting particles.
 * These create the atmospheric "smoke in a dark room" effect.
 */
function VolumetricFog() {
  const ref = useRef<THREE.Points>(null)

  const texture = useMemo(() => createSoftCircleTexture(128, 'rgba(100,120,160,0.15)', 1.5), [])

  const { positions, seeds } = useMemo(() => {
    const pos = new Float32Array(FOG_COUNT * 3)
    const sd = new Float32Array(FOG_COUNT * 3)

    for (let i = 0; i < FOG_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 0.8 + Math.random() * 6
      const height = (Math.random() - 0.5) * 4

      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = height
      pos[i * 3 + 2] = Math.sin(angle) * radius

      sd[i * 3] = Math.random() * 100
      sd[i * 3 + 1] = 0.3 + Math.random() * 0.7
      sd[i * 3 + 2] = Math.random() * Math.PI * 2
    }
    return { positions: pos, seeds: sd }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute

    for (let i = 0; i < FOG_COUNT; i++) {
      const phase = seeds[i * 3]
      const speed = seeds[i * 3 + 1]
      const angOff = seeds[i * 3 + 2]

      const x = posAttr.getX(i)
      const y = posAttr.getY(i)
      const z = posAttr.getZ(i)

      posAttr.setXYZ(
        i,
        x + Math.sin(t * 0.05 * speed + phase) * 0.002,
        y + 0.0004 * speed + Math.sin(t * 0.15 + phase) * 0.0003,
        z + Math.cos(t * 0.05 * speed + angOff) * 0.002
      )

      const cy = posAttr.getY(i)
      const cx = posAttr.getX(i)
      const cz = posAttr.getZ(i)
      const dist = Math.sqrt(cx * cx + cz * cz)
      if (cy > 2.5 || dist > 8) {
        const newAngle = Math.random() * Math.PI * 2
        const newRadius = 0.8 + Math.random() * 6
        posAttr.setXYZ(
          i,
          Math.cos(newAngle) * newRadius,
          -2 + Math.random() * 0.8,
          Math.sin(newAngle) * newRadius
        )
      }
    }
    posAttr.needsUpdate = true
    ref.current.rotation.y = t * 0.005
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        map={texture}
        color="#667799"
        size={0.4}
        transparent
        opacity={0.035}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

/**
 * Inner mist — tighter, brighter particles closer to the core.
 * Creates the illusion of energy/heat emanating from the device.
 */
function InnerMist() {
  const ref = useRef<THREE.Points>(null)

  const texture = useMemo(() => createSoftCircleTexture(64, 'rgba(255,255,255,0.15)', 2), [])

  const { positions, seeds } = useMemo(() => {
    const pos = new Float32Array(MIST_COUNT * 3)
    const sd = new Float32Array(MIST_COUNT * 2)

    for (let i = 0; i < MIST_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 0.5 + Math.random() * 2.5
      const height = (Math.random() - 0.5) * 1.5

      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = height + 0.3
      pos[i * 3 + 2] = Math.sin(angle) * radius

      sd[i * 2] = Math.random() * 100
      sd[i * 2 + 1] = 0.5 + Math.random() * 1
    }
    return { positions: pos, seeds: sd }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute

    for (let i = 0; i < MIST_COUNT; i++) {
      const phase = seeds[i * 2]
      const speed = seeds[i * 2 + 1]

      const x = posAttr.getX(i)
      const y = posAttr.getY(i)
      const z = posAttr.getZ(i)

      const swirl = t * 0.08 * speed + phase
      posAttr.setXYZ(
        i,
        x + Math.sin(swirl) * 0.0015,
        y + 0.0006 * speed,
        z + Math.cos(swirl) * 0.0015
      )

      if (posAttr.getY(i) > 1.8) {
        const newAngle = Math.random() * Math.PI * 2
        const newRadius = 0.5 + Math.random() * 2.5
        posAttr.setXYZ(
          i,
          Math.cos(newAngle) * newRadius,
          -0.5 + Math.random() * 0.3,
          Math.sin(newAngle) * newRadius
        )
      }
    }
    posAttr.needsUpdate = true
    ref.current.rotation.y = t * 0.008
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        map={texture}
        color="#ffffff"
        size={0.15}
        transparent
        opacity={0.03}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

const GOLD_COUNT = 200

function GoldenEnergy() {
  const ref = useRef<THREE.Points>(null)

  const texture = useMemo(() => createSoftCircleTexture(64, 'rgba(212,168,83,0.25)', 2), [])

  const { positions, seeds } = useMemo(() => {
    const pos = new Float32Array(GOLD_COUNT * 3)
    const sd = new Float32Array(GOLD_COUNT * 3)

    for (let i = 0; i < GOLD_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 1.5 + Math.random() * 1.5
      const height = (Math.random() - 0.5) * 1.2

      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = height + 0.3
      pos[i * 3 + 2] = Math.sin(angle) * radius

      sd[i * 3] = Math.random() * 100
      sd[i * 3 + 1] = 0.3 + Math.random() * 0.7
      sd[i * 3 + 2] = angle
    }
    return { positions: pos, seeds: sd }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute

    for (let i = 0; i < GOLD_COUNT; i++) {
      const phase = seeds[i * 3]
      const speed = seeds[i * 3 + 1]
      const baseAngle = seeds[i * 3 + 2]

      // Slow orbit + vertical undulation
      const orbitAngle = baseAngle + t * 0.03 * speed
      const radius = 1.5 + Math.sin(t * 0.1 + phase) * 0.5 + Math.sin(t * 0.7 + phase * 12.9898) * 0.01
      const yOffset = Math.sin(t * 0.2 * speed + phase) * 0.3

      posAttr.setXYZ(
        i,
        Math.cos(orbitAngle) * radius,
        0.3 + yOffset,
        Math.sin(orbitAngle) * radius
      )

      // Recycle if too far
      const dist = Math.sqrt(
        posAttr.getX(i) ** 2 + posAttr.getZ(i) ** 2
      )
      if (dist > 3.5) {
        const newAngle = Math.random() * Math.PI * 2
        const newRadius = 1.5 + Math.random() * 0.5
        posAttr.setXYZ(i, Math.cos(newAngle) * newRadius, 0.3, Math.sin(newAngle) * newRadius)
      }
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        map={texture}
        color="#d4a853"
        size={0.2}
        transparent
        opacity={0.04}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

export default function HudRing() {
  return (
    <group>
      <VolumetricFog />
      <InnerMist />
      <GoldenEnergy />
    </group>
  )
}
