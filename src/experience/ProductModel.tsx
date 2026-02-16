import { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Mobile has no post-processing (bloom/tone mapping) — bright emissives flash harshly
const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768

/**
 * kr8tiv Device with white/grey neural net that distorts around the mouse.
 * The wireframe shells are off-white and warp where the cursor is closest.
 */
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

  // Create geometries and store originals
  const outerGeo = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(2.2, 2)
    return geo
  }, [])

  const innerGeo = useMemo(() => {
    const geo = new THREE.DodecahedronGeometry(1.7, 1)
    return geo
  }, [])

  // Copy original positions once geometries mount
  useEffect(() => {
    const outerPos = outerGeo.attributes.position as THREE.BufferAttribute
    outerOriginal.current = new Float32Array(outerPos.array)

    const innerPos = innerGeo.attributes.position as THREE.BufferAttribute
    innerOriginal.current = new Float32Array(innerPos.array)
  }, [outerGeo, innerGeo])

  // Hoisted plane + target to avoid per-frame allocations
  const _rayPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])
  const _rayTarget = useMemo(() => new THREE.Vector3(), [])

  const onPointerMove = useCallback(() => {
    raycaster.setFromCamera(pointer, camera)
    raycaster.ray.intersectPlane(_rayPlane, _rayTarget)
    if (_rayTarget) {
      mouseWorldPos.current.copy(_rayTarget)
    }
  }, [raycaster, pointer, camera, _rayPlane, _rayTarget])

  // Temp vectors to avoid GC
  const _vertPos = useMemo(() => new THREE.Vector3(), [])
  const _dir = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (hovered) onPointerMove()

    // Barely perceptible float
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.3) * 0.015
    }

    // Amber glow pulse (steady on mobile — no post-processing to soften pulses)
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = IS_MOBILE ? 0.8 : 1.5 + Math.sin(t * 1.5) * 0.15
    }

    // Neural net rotation + distortion
    if (shellRef.current && outerOriginal.current) {
      shellRef.current.rotation.y = t * 0.015
      shellRef.current.rotation.x = Math.sin(t * 0.12) * 0.02

      const mat = shellRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = hovered ? 0.18 : 0.07
      mat.emissiveIntensity = hovered ? 0.5 : 0.12

      // Vertex distortion based on mouse proximity
      const posAttr = shellRef.current.geometry.attributes.position as THREE.BufferAttribute
      const orig = outerOriginal.current
      const mouse = mouseWorldPos.current
      const distortRadius = 2.0
      const distortStrength = hovered ? 0.35 : 0

      for (let i = 0; i < posAttr.count; i++) {
        const ox = orig[i * 3]
        const oy = orig[i * 3 + 1]
        const oz = orig[i * 3 + 2]

        // Get vertex in world-ish space (offset by group position)
        _vertPos.set(ox, oy + 0.3, oz)

        const dist = _vertPos.distanceTo(mouse)

        if (dist < distortRadius && distortStrength > 0) {
          // Push vertex outward from center, scaled by proximity
          const influence = 1 - dist / distortRadius
          const push = influence * influence * distortStrength

          _dir.set(ox, oy, oz).normalize()
          posAttr.setXYZ(
            i,
            ox + _dir.x * push,
            oy + _dir.y * push,
            oz + _dir.z * push
          )
        } else {
          // Lerp back to original
          const cx = posAttr.getX(i)
          const cy = posAttr.getY(i)
          const cz = posAttr.getZ(i)
          posAttr.setXYZ(
            i,
            cx + (ox - cx) * 0.08,
            cy + (oy - cy) * 0.08,
            cz + (oz - cz) * 0.08
          )
        }
      }
      posAttr.needsUpdate = true
    }

    if (innerShellRef.current && innerOriginal.current) {
      innerShellRef.current.rotation.y = -t * 0.02
      innerShellRef.current.rotation.z = Math.sin(t * 0.1) * 0.015

      const mat = innerShellRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = hovered ? 0.12 : 0.04
      mat.emissiveIntensity = hovered ? 0.35 : 0.08

      // Inner shell distortion (subtler)
      const posAttr = innerShellRef.current.geometry.attributes.position as THREE.BufferAttribute
      const orig = innerOriginal.current
      const mouse = mouseWorldPos.current
      const distortRadius = 1.8
      const distortStrength = hovered ? 0.25 : 0

      for (let i = 0; i < posAttr.count; i++) {
        const ox = orig[i * 3]
        const oy = orig[i * 3 + 1]
        const oz = orig[i * 3 + 2]

        _vertPos.set(ox, oy + 0.3, oz)
        const dist = _vertPos.distanceTo(mouse)

        if (dist < distortRadius && distortStrength > 0) {
          const influence = 1 - dist / distortRadius
          const push = influence * influence * distortStrength

          _dir.set(ox, oy, oz).normalize()
          posAttr.setXYZ(
            i,
            ox + _dir.x * push,
            oy + _dir.y * push,
            oz + _dir.z * push
          )
        } else {
          const cx = posAttr.getX(i)
          const cy = posAttr.getY(i)
          const cz = posAttr.getZ(i)
          posAttr.setXYZ(
            i,
            cx + (ox - cx) * 0.08,
            cy + (oy - cy) * 0.08,
            cz + (oz - cz) * 0.08
          )
        }
      }
      posAttr.needsUpdate = true
    }

    // Mouse-following light
    if (mouseLight.current && hovered) {
      mouseLight.current.position.lerp(mouseWorldPos.current, 0.1)
      mouseLight.current.intensity = 0.4 + Math.sin(t * 3) * 0.08
    } else if (mouseLight.current) {
      mouseLight.current.intensity *= 0.95
    }

    // Energy core (steady on mobile — pulse causes flashing through glass without tone mapping)
    if (energyCoreRef.current) {
      energyCoreRef.current.intensity = IS_MOBILE ? 0.15 : 0.35 + Math.sin(t * 1.2) * 0.08
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

        {/* Glass top surface — simple glossy on mobile (transmission flickers without post-processing) */}
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

        {/* Amber edge strip — front (nudged out to prevent z-fighting) */}
        <mesh ref={glowRef} position={[0, 0, 0.812]}>
          <boxGeometry args={[2.2, 0.06, 0.02]} />
          <meshStandardMaterial
            color="#d4a853"
            emissive="#d4a853"
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>

        {/* Amber edge strip — back (nudged out to prevent z-fighting) */}
        <mesh position={[0, 0, -0.812]}>
          <boxGeometry args={[2.2, 0.06, 0.02]} />
          <meshStandardMaterial
            color="#d4a853"
            emissive="#d4a853"
            emissiveIntensity={1.4}
            toneMapped={false}
          />
        </mesh>

        {/* White side accent lights (nudged out to prevent z-fighting) */}
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

        {/* Top indicator dot — raised above glass to avoid z-fighting flicker */}
        <mesh position={[0, 0.305, 0]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={IS_MOBILE ? 0.3 : 1.5}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* === NEURAL NET — WHITE/GREY, mouse-interactive with distortion === */}

      {/* Outer icosahedron — off-white wireframe */}
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

      {/* Inner dodecahedron — slightly darker grey */}
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

      {/* Mouse-following point light */}
      <pointLight
        ref={mouseLight}
        position={[0, 0, 3]}
        color="#ffffff"
        intensity={0}
        distance={3}
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
