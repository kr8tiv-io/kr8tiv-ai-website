import { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import EnergyLines from './EnergyLines'

/* ─────────────────────────────────────────────────────────────
   ProductModel — Enhanced kr8tiv device with:

   PERFORMANCE:
   - Vertex distortion uses spring physics (smoother, same cost)
   - Reduced unnecessary per-frame allocations

   VISUAL UPGRADES:
   - Stronger mouse vertex ATTRACTION (not just push — magnetic pull)
   - Elastic snapback with overshoot (spring physics, not linear lerp)
   - EnergyLines integration — animated pulses along wireframe edges
   - Stronger hover state — the whole device reacts
   - Iridescent shell edges on hover
   ──────────────────────────────────────────────────────────── */

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768

export default function ProductModel() {
  const groupRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const shellRef = useRef<THREE.Mesh>(null)
  const innerShellRef = useRef<THREE.Mesh>(null)
  const energyCoreRef = useRef<THREE.PointLight>(null)
  const mouseLight = useRef<THREE.PointLight>(null)

  const [hovered, setHovered] = useState(false)
  const mouseWorldPos = useRef(new THREE.Vector3())

  const { raycaster, pointer, camera } = useThree()

  // Store original vertex positions for distortion reset
  const outerOriginal = useRef<Float32Array | null>(null)
  const innerOriginal = useRef<Float32Array | null>(null)

  // Spring velocities for elastic snapback
  const outerVelocities = useRef<Float32Array | null>(null)
  const innerVelocities = useRef<Float32Array | null>(null)

  const outerGeo = useMemo(() => new THREE.IcosahedronGeometry(2.2, 2), [])
  const innerGeo = useMemo(() => new THREE.DodecahedronGeometry(1.7, 1), [])

  // Copy original positions and init velocity buffers
  useEffect(() => {
    const outerPos = outerGeo.attributes.position as THREE.BufferAttribute
    outerOriginal.current = new Float32Array(outerPos.array)
    outerVelocities.current = new Float32Array(outerPos.count * 3)

    const innerPos = innerGeo.attributes.position as THREE.BufferAttribute
    innerOriginal.current = new Float32Array(innerPos.array)
    innerVelocities.current = new Float32Array(innerPos.count * 3)
  }, [outerGeo, innerGeo])

  // Reusable objects
  const _rayPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])
  const _rayTarget = useMemo(() => new THREE.Vector3(), [])
  const _vertPos = useMemo(() => new THREE.Vector3(), [])
  const _dir = useMemo(() => new THREE.Vector3(), [])
  const _targetPos = useMemo(() => new THREE.Vector3(), [])

  const onPointerMove = useCallback(() => {
    raycaster.setFromCamera(pointer, camera)
    raycaster.ray.intersectPlane(_rayPlane, _rayTarget)
    if (_rayTarget) {
      mouseWorldPos.current.copy(_rayTarget)
    }
  }, [raycaster, pointer, camera, _rayPlane, _rayTarget])

  // Spring physics constants
  const SPRING_K = 0.12      // Spring stiffness
  const SPRING_DAMPING = 0.82 // Damping (< 1 = underdamped = overshoot)
  const ATTRACT_RADIUS = 2.5  // Mouse influence radius
  const ATTRACT_STRENGTH = 0.45 // How strongly vertices pull toward mouse

  /**
   * Spring-based vertex distortion.
   * Vertices are attracted toward the mouse with spring physics,
   * creating elastic snapback with natural overshoot.
   */
  function updateShellSpring(
    mesh: THREE.Mesh,
    original: Float32Array,
    velocities: Float32Array,
    isHovered: boolean,
    attractStrength: number
  ) {
    const posAttr = mesh.geometry.attributes.position as THREE.BufferAttribute
    const mouse = mouseWorldPos.current
    const strength = isHovered ? attractStrength : 0

    for (let i = 0; i < posAttr.count; i++) {
      const i3 = i * 3
      const ox = original[i3]
      const oy = original[i3 + 1]
      const oz = original[i3 + 2]

      const cx = posAttr.getX(i)
      const cy = posAttr.getY(i)
      const cz = posAttr.getZ(i)

      // Get vertex world position (approximate)
      _vertPos.set(ox, oy + 0.3, oz)
      const dist = _vertPos.distanceTo(mouse)

      // Compute target position
      if (dist < ATTRACT_RADIUS && strength > 0) {
        const influence = 1 - dist / ATTRACT_RADIUS
        const pull = influence * influence * strength

        // Direction FROM vertex TOWARD mouse (magnetic attraction)
        _dir.set(
          mouse.x - ox,
          mouse.y - 0.3 - oy,
          mouse.z - oz
        ).normalize()

        _targetPos.set(
          ox + _dir.x * pull,
          oy + _dir.y * pull,
          oz + _dir.z * pull
        )
      } else {
        _targetPos.set(ox, oy, oz)
      }

      // Spring force: F = -k * (current - target)
      const forceX = -SPRING_K * (cx - _targetPos.x)
      const forceY = -SPRING_K * (cy - _targetPos.y)
      const forceZ = -SPRING_K * (cz - _targetPos.z)

      // Update velocity with damping
      velocities[i3] = (velocities[i3] + forceX) * SPRING_DAMPING
      velocities[i3 + 1] = (velocities[i3 + 1] + forceY) * SPRING_DAMPING
      velocities[i3 + 2] = (velocities[i3 + 2] + forceZ) * SPRING_DAMPING

      // Apply velocity
      posAttr.setXYZ(
        i,
        cx + velocities[i3],
        cy + velocities[i3 + 1],
        cz + velocities[i3 + 2]
      )
    }
    posAttr.needsUpdate = true
  }

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (hovered) onPointerMove()

    // Subtle float
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.3) * 0.015
    }

    // Amber glow pulse
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = IS_MOBILE ? 0.8 : 1.5 + Math.sin(t * 1.5) * 0.15
    }

    // Outer shell — spring distortion
    if (shellRef.current && outerOriginal.current && outerVelocities.current) {
      shellRef.current.rotation.y = t * 0.015
      shellRef.current.rotation.x = Math.sin(t * 0.12) * 0.02

      const mat = shellRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = hovered ? 0.18 : 0.07
      mat.emissiveIntensity = hovered ? 0.5 : 0.12

      updateShellSpring(
        shellRef.current,
        outerOriginal.current,
        outerVelocities.current,
        hovered,
        ATTRACT_STRENGTH
      )
    }

    // Inner shell — spring distortion (subtler)
    if (innerShellRef.current && innerOriginal.current && innerVelocities.current) {
      innerShellRef.current.rotation.y = -t * 0.02
      innerShellRef.current.rotation.z = Math.sin(t * 0.1) * 0.015

      const mat = innerShellRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = hovered ? 0.12 : 0.04
      mat.emissiveIntensity = hovered ? 0.35 : 0.08

      updateShellSpring(
        innerShellRef.current,
        innerOriginal.current,
        innerVelocities.current,
        hovered,
        ATTRACT_STRENGTH * 0.65
      )
    }

    // Mouse-following light — brighter on hover
    if (mouseLight.current && hovered) {
      mouseLight.current.position.lerp(mouseWorldPos.current, 0.1)
      mouseLight.current.intensity = 0.6 + Math.sin(t * 3) * 0.12
    } else if (mouseLight.current) {
      mouseLight.current.intensity *= 0.92
    }

    // Energy core
    if (energyCoreRef.current) {
      energyCoreRef.current.intensity = IS_MOBILE
        ? 0.15
        : 0.35 + Math.sin(t * 1.2) * 0.08
    }
  })

  return (
    <group position={[0, 0.3, 0]}>
      {/* === THE BOX === */}
      <group ref={groupRef}>
        {/* Main body — dark metallic slab */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.5, 1.6]} />
          <meshPhysicalMaterial
            color="#050508"
            metalness={0.95}
            roughness={0.08}
            envMapIntensity={2}
            clearcoat={0.5}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Glass top surface */}
        <mesh position={[0, 0.26, 0]}>
          <boxGeometry args={[2.3, 0.02, 1.5]} />
          {IS_MOBILE ? (
            <meshPhysicalMaterial
              color="#080a14"
              metalness={0.9}
              roughness={0.05}
              clearcoat={1}
              clearcoatRoughness={0.1}
              envMapIntensity={0.6}
            />
          ) : (
            <meshPhysicalMaterial
              color="#060810"
              metalness={0.05}
              roughness={0.01}
              transmission={0.75}
              thickness={1}
              ior={2.0}
              clearcoat={1}
              clearcoatRoughness={0}
              envMapIntensity={2.5}
              iridescence={0.8}
              iridescenceIOR={1.6}
              iridescenceThicknessRange={[100, 500]}
              attenuationColor={new THREE.Color('#ffffff')}
              attenuationDistance={1}
            />
          )}
        </mesh>

        {/* Amber edge strip — front */}
        <mesh ref={glowRef} position={[0, 0, 0.812]}>
          <boxGeometry args={[2.2, 0.06, 0.02]} />
          <meshStandardMaterial
            color="#d4a853"
            emissive="#d4a853"
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>

        {/* Amber edge strip — back */}
        <mesh position={[0, 0, -0.812]}>
          <boxGeometry args={[2.2, 0.06, 0.02]} />
          <meshStandardMaterial
            color="#d4a853"
            emissive="#d4a853"
            emissiveIntensity={1.4}
            toneMapped={false}
          />
        </mesh>

        {/* White side accent lights */}
        <mesh position={[1.212, 0, 0]}>
          <boxGeometry args={[0.02, 0.04, 1.4]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.5}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[-1.212, 0, 0]}>
          <boxGeometry args={[0.02, 0.04, 1.4]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.5}
            toneMapped={false}
          />
        </mesh>

      </group>

      {/* === NEURAL NET — WHITE/GREY, spring-physics mouse-interactive === */}

      {/* Outer icosahedron wireframe */}
      <mesh
        ref={shellRef}
        geometry={outerGeo}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <meshStandardMaterial
          color="#b0b0b0"
          emissive="#ffffff"
          emissiveIntensity={0.12}
          wireframe
          transparent
          opacity={0.07}
          toneMapped={false}
        />
      </mesh>

      {/* Inner dodecahedron wireframe */}
      <mesh
        ref={innerShellRef}
        geometry={innerGeo}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <meshStandardMaterial
          color="#909090"
          emissive="#cccccc"
          emissiveIntensity={0.08}
          wireframe
          transparent
          opacity={0.04}
          toneMapped={false}
        />
      </mesh>

      {/* === ENERGY LINES — animated neural network pulses === */}
      <EnergyLines hovered={hovered} mouseWorldPos={mouseWorldPos.current} />

      {/* Mouse-following point light */}
      <pointLight
        ref={mouseLight}
        position={[0, 0, 3]}
        color="#ffffff"
        intensity={0}
        distance={4}
        decay={2}
      />

      {/* Energy core glow */}
      <pointLight
        ref={energyCoreRef}
        position={[0, 0.3, 0]}
        color="#d4a853"
        intensity={0.6}
        distance={4}
        decay={2}
      />
    </group>
  )
}
