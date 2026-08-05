import { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import type { DeviceTier } from '../hooks/useDeviceCapability'
import { brushedRoughness, grimeMap, microNormal } from './surfaces'

/* ─────────────────────────────────────────────────────────────
   OpsMachine — the back-office engine.

   A robotic arm endlessly picks glowing paper chits (receipts,
   quotes, invoices) out of a chaotic intake pile and files them
   into an ordered, illuminated grid. Chaos in, order out.

   - Two-link analytic IK so the arm genuinely tracks its target
   - Chit carried by sampling the gripper tip's world position
   - Grid cells light as they fill; full grid flushes and the
     cycle restarts
   - Scroll velocity feeds the work rate (reads __kr8tiv_scrollVel)
   - Neural wireframe shells with mouse-proximity distortion kept
     from the original device
   ──────────────────────────────────────────────────────────── */

interface OpsMachineProps {
  tier: DeviceTier
}

// ── Layout constants ────────────────────────────────────────
const CHASSIS_TOP = 0.25
const CHIT_Y = CHASSIS_TOP + 0.03
const PILE_CENTER = new THREE.Vector3(-1.15, CHIT_Y, 0)
const GRID_CENTER_X = 1.15
const GRID_SPACING = 0.3
const CHIT_COUNT = 9

// Deterministic scattered pile (hand-tuned chaos)
const PILE_OFFSETS: Array<[number, number, number]> = [
  [-0.18, 0.0, -0.15], [0.11, 0.012, 0.16], [0.02, 0.024, -0.03],
  [-0.08, 0.036, 0.11], [0.19, 0.0, -0.08], [-0.21, 0.012, 0.06],
  [0.06, 0.048, 0.05], [-0.02, 0.06, -0.13], [0.14, 0.024, 0.1],
]

const PILE_ROTATIONS = [0.6, -0.9, 0.25, -0.4, 1.2, -0.15, 0.8, -0.65, 0.35]

function gridPos(i: number): THREE.Vector3 {
  const col = i % 3
  const row = Math.floor(i / 3)
  return new THREE.Vector3(
    GRID_CENTER_X - GRID_SPACING + col * GRID_SPACING,
    CHIT_Y,
    -GRID_SPACING + row * GRID_SPACING
  )
}

// ── Arm kinematics ──────────────────────────────────────────
const SHOULDER_Y = CHASSIS_TOP + 0.46 // shoulder pivot height (world)
const L1 = 0.85 // shoulder → elbow
const L2 = 0.85 // elbow → gripper tip

// Solve 2-link IK in the vertical plane. Returns [shoulder, elbow] Z-rotations
// for the arm chain that extends along local +x at zero rotation.
function solveIK(dx: number, dy: number): [number, number] {
  const distSq = dx * dx + dy * dy
  const dist = Math.min(Math.sqrt(distSq), L1 + L2 - 0.01)
  const d = Math.max(-1, Math.min(1, (dist * dist - L1 * L1 - L2 * L2) / (2 * L1 * L2)))
  const inner = Math.acos(d)
  const shoulder =
    Math.atan2(dy, Math.max(dx, 0.001)) + Math.atan2(L2 * Math.sin(inner), L1 + L2 * Math.cos(inner))
  return [shoulder, -inner]
}

// ── Cycle timing ────────────────────────────────────────────
const CYCLE = 4.0 // seconds per chit
const FLUSH = 2.6 // grid-flush interlude
const LOOP = CHIT_COUNT * CYCLE + FLUSH

// Keyframes within one pick-place cycle (t in [0,1])
const KF_TIMES = [0.0, 0.13, 0.2, 0.3, 0.56, 0.68, 0.74, 0.84, 1.0]
const GRAB_T = 0.2
const RELEASE_T = 0.74

function smooth(t: number) {
  return t * t * (3 - 2 * t)
}

export default function OpsMachine({ tier }: OpsMachineProps) {
  const lowTier = tier === 'low'
  const mediumTier = tier === 'medium'

  // ── Arm refs ──
  const turretRef = useRef<THREE.Group>(null)
  const shoulderRef = useRef<THREE.Group>(null)
  const elbowRef = useRef<THREE.Group>(null)
  const wristRef = useRef<THREE.Group>(null)
  const tipRef = useRef<THREE.Object3D>(null)
  const gripLRef = useRef<THREE.Mesh>(null)
  const gripRRef = useRef<THREE.Mesh>(null)
  const beamRef = useRef<THREE.Mesh>(null)

  // ── Chit + cell refs ──
  const chitRefs = useRef<Array<THREE.Mesh | null>>([])
  const cellRefs = useRef<Array<THREE.Mesh | null>>([])

  // ── Sim state (all refs — zero React re-renders) ──
  const phaseRef = useRef(0) // accumulated loop time (speed-modulated)
  const chitState = useRef<Array<'pile' | 'carried' | 'placed'>>(
    new Array(CHIT_COUNT).fill('pile')
  )
  const cellLit = useRef<number[]>(new Array(CHIT_COUNT).fill(0))

  // ── Neural shells (kept from the original device) ──
  const shellRef = useRef<THREE.Mesh>(null)
  const innerShellRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const mouseWorldPos = useRef(new THREE.Vector3())
  const { raycaster, pointer, camera } = useThree()

  const outerGeo = useMemo(() => new THREE.IcosahedronGeometry(2.9, 2), [])
  const innerGeo = useMemo(() => new THREE.DodecahedronGeometry(2.2, 1), [])
  const outerOriginal = useRef<Float32Array | null>(null)
  const innerOriginal = useRef<Float32Array | null>(null)

  useEffect(() => {
    outerOriginal.current = new Float32Array(
      (outerGeo.attributes.position as THREE.BufferAttribute).array
    )
    innerOriginal.current = new Float32Array(
      (innerGeo.attributes.position as THREE.BufferAttribute).array
    )
  }, [outerGeo, innerGeo])

  const _rayPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])
  const _rayTarget = useMemo(() => new THREE.Vector3(), [])
  const onPointerMove = useCallback(() => {
    raycaster.setFromCamera(pointer, camera)
    raycaster.ray.intersectPlane(_rayPlane, _rayTarget)
    mouseWorldPos.current.copy(_rayTarget)
  }, [raycaster, pointer, camera, _rayPlane, _rayTarget])

  // ── Scratch vectors (no per-frame allocation) ──
  const _target = useMemo(() => new THREE.Vector3(), [])
  const _tipWorld = useMemo(() => new THREE.Vector3(), [])
  const _kfA = useMemo(() => new THREE.Vector3(), [])
  const _kfB = useMemo(() => new THREE.Vector3(), [])
  const _vertPos = useMemo(() => new THREE.Vector3(), [])
  const _dir = useMemo(() => new THREE.Vector3(), [])

  const glowRef = useRef<THREE.Mesh>(null)
  const coreLightRef = useRef<THREE.PointLight>(null)

  // Keyframe target position for cycle-index i at keyframe k
  const keyframePoint = (out: THREE.Vector3, k: number, chitIdx: number) => {
    const pile = _kfA.set(
      PILE_CENTER.x + PILE_OFFSETS[chitIdx][0],
      CHIT_Y + PILE_OFFSETS[chitIdx][1],
      PILE_CENTER.z + PILE_OFFSETS[chitIdx][2]
    )
    const slot = gridPos(chitIdx)
    switch (k) {
      case 0: return out.set(0, SHOULDER_Y + 0.55, 0.4) // rest arc, front-high
      case 1: return out.set(pile.x, pile.y + 0.42, pile.z)
      case 2: return out.set(pile.x, pile.y + 0.13, pile.z) // grab
      case 3: return out.set(pile.x, pile.y + 0.6, pile.z)
      case 4: return out.set((pile.x + slot.x) / 2, CHIT_Y + 0.95, (pile.z + slot.z) / 2)
      case 5: return out.set(slot.x, slot.y + 0.45, slot.z)
      case 6: return out.set(slot.x, slot.y + 0.14, slot.z) // release
      case 7: return out.set(slot.x, slot.y + 0.5, slot.z)
      default: return out.set(0, SHOULDER_Y + 0.55, 0.4)
    }
  }

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    if (hovered) onPointerMove()

    // ── Work rate reacts to scroll velocity ──
    const vel = Math.min(Math.abs((window as any).__kr8tiv_scrollVel ?? 0), 1200)
    const speed = 1 + (vel / 1200) * 0.9
    phaseRef.current = (phaseRef.current + Math.min(delta, 0.05) * speed) % LOOP

    const loopT = phaseRef.current
    const inFlush = loopT >= CHIT_COUNT * CYCLE

    // ── Determine current cycle + intra-cycle time ──
    const cycleIdx = Math.min(Math.floor(loopT / CYCLE), CHIT_COUNT - 1)
    const cycleT = inFlush ? 1 : (loopT - cycleIdx * CYCLE) / CYCLE

    // ── Reset chit/cell state at loop boundaries ──
    if (inFlush) {
      const flushT = (loopT - CHIT_COUNT * CYCLE) / FLUSH
      // Cells pulse together, then everything dims + chits sink home
      for (let i = 0; i < CHIT_COUNT; i++) {
        const pulse = Math.sin(flushT * Math.PI * 3 + i * 0.3) * 0.5 + 0.5
        cellLit.current[i] = Math.max(0, (1 - flushT) * (0.55 + pulse * 0.45))
        const chit = chitRefs.current[i]
        if (chit && chitState.current[i] === 'placed') {
          const mat = chit.material as THREE.MeshStandardMaterial
          mat.opacity = Math.max(0, 1 - flushT * 1.6)
          if (flushT > 0.85) {
            // teleport home invisible; will fade back in next loop
            chitState.current[i] = 'pile'
          }
        }
      }
    } else {
      // ── Advance state machine on grab/release edges ──
      if (cycleT >= GRAB_T && chitState.current[cycleIdx] === 'pile') {
        chitState.current[cycleIdx] = 'carried'
      }
      if (cycleT >= RELEASE_T && chitState.current[cycleIdx] === 'carried') {
        chitState.current[cycleIdx] = 'placed'
        cellLit.current[cycleIdx] = 1.4 // bright flash on placement, decays below
      }
    }

    // ── IK target from piecewise keyframes ──
    let seg = 0
    while (seg < KF_TIMES.length - 2 && cycleT > KF_TIMES[seg + 1]) seg++
    const segT = smooth(
      Math.max(0, Math.min(1, (cycleT - KF_TIMES[seg]) / (KF_TIMES[seg + 1] - KF_TIMES[seg])))
    )
    keyframePoint(_kfA, seg, cycleIdx)
    const a = _target.copy(_kfA)
    keyframePoint(_kfB, seg + 1, cycleIdx)
    a.lerp(_kfB, segT)
    if (inFlush) {
      // During flush the arm returns to a slow scanning sweep
      const flushT = (loopT - CHIT_COUNT * CYCLE) / FLUSH
      _target.set(Math.sin(flushT * Math.PI * 2) * 0.8, SHOULDER_Y + 0.5, 0.5)
    }

    // ── Drive the arm: turret yaw + planar 2-link IK ──
    const yaw = Math.atan2(_target.z, _target.x)
    const horiz = Math.max(0.15, Math.sqrt(_target.x * _target.x + _target.z * _target.z))
    const [shoulderRot, elbowRot] = solveIK(horiz, _target.y - SHOULDER_Y)

    if (turretRef.current) {
      // shortest-path yaw smoothing
      let dYaw = yaw - turretRef.current.rotation.y
      while (dYaw > Math.PI) dYaw -= Math.PI * 2
      while (dYaw < -Math.PI) dYaw += Math.PI * 2
      turretRef.current.rotation.y += dYaw * Math.min(1, delta * 7)
    }
    if (shoulderRef.current) {
      shoulderRef.current.rotation.z +=
        (shoulderRot - shoulderRef.current.rotation.z) * Math.min(1, delta * 9)
    }
    if (elbowRef.current) {
      elbowRef.current.rotation.z +=
        (elbowRot - elbowRef.current.rotation.z) * Math.min(1, delta * 9)
    }
    if (wristRef.current && shoulderRef.current && elbowRef.current) {
      // keep the gripper pointing straight down
      wristRef.current.rotation.z =
        -Math.PI / 2 - (shoulderRef.current.rotation.z + elbowRef.current.rotation.z)
    }

    // Gripper fingers pinch while carrying
    const carrying = !inFlush && cycleT >= GRAB_T && cycleT < RELEASE_T
    const pinch = carrying ? 0.035 : 0.075
    if (gripLRef.current) gripLRef.current.position.x += (pinch - gripLRef.current.position.x) * 0.25
    if (gripRRef.current) gripRRef.current.position.x += (-pinch - gripRRef.current.position.x) * 0.25

    // ── Chits ──
    if (tipRef.current) tipRef.current.getWorldPosition(_tipWorld)
    for (let i = 0; i < CHIT_COUNT; i++) {
      const chit = chitRefs.current[i]
      if (!chit) continue
      const mat = chit.material as THREE.MeshStandardMaterial
      const st = chitState.current[i]
      if (st === 'pile') {
        chit.position.set(
          PILE_CENTER.x + PILE_OFFSETS[i][0],
          CHIT_Y + PILE_OFFSETS[i][1],
          PILE_CENTER.z + PILE_OFFSETS[i][2]
        )
        chit.rotation.set(0, PILE_ROTATIONS[i], 0)
        mat.opacity = Math.min(1, mat.opacity + delta * 1.5)
        mat.emissive.setHex(0xffffff)
        mat.emissiveIntensity = 0.32 + Math.sin(t * 1.4 + i) * 0.06
      } else if (st === 'carried') {
        chit.position.lerp(
          _kfA.set(_tipWorld.x, _tipWorld.y - 0.09, _tipWorld.z),
          Math.min(1, delta * 18)
        )
        chit.rotation.y += (0 - chit.rotation.y) * 0.1
        mat.opacity = 1
        mat.emissiveIntensity = 0.55
      } else {
        const slot = gridPos(i)
        chit.position.lerp(slot, Math.min(1, delta * 10))
        chit.rotation.y += (0 - chit.rotation.y) * 0.2
        if (!inFlush) mat.opacity = 1
        mat.emissive.setHex(0xd4a853)
        mat.emissiveIntensity = 0.5 + Math.sin(t * 2 + i) * 0.08
      }
    }

    // ── Grid cells: decay toward steady lit level ──
    for (let i = 0; i < CHIT_COUNT; i++) {
      const cell = cellRefs.current[i]
      if (!cell) continue
      if (!inFlush) {
        const settled = chitState.current[i] === 'placed' ? 0.55 : 0.05
        cellLit.current[i] += (settled - cellLit.current[i]) * Math.min(1, delta * 3)
      }
      const mat = cell.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = cellLit.current[i]
    }

    // ── Pickup/placement beam ──
    if (beamRef.current) {
      const beamOn =
        !inFlush && ((cycleT > 0.13 && cycleT < 0.28) || (cycleT > 0.62 && cycleT < 0.8))
      const beamMat = beamRef.current.material as THREE.MeshBasicMaterial
      beamMat.opacity += ((beamOn ? 0.22 : 0) - beamMat.opacity) * 0.2
      if (beamMat.opacity > 0.01) {
        const len = Math.max(0.05, _tipWorld.y - CHIT_Y)
        beamRef.current.position.set(_tipWorld.x, _tipWorld.y - len / 2, _tipWorld.z)
        beamRef.current.scale.set(1, len, 1)
      }
    }

    // ── Brand strip pulse ──
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial
      const base = lowTier ? 0.46 : mediumTier ? 0.5 : 0.54
      mat.emissiveIntensity = base + Math.sin(t * 0.6) * 0.05
    }
    if (coreLightRef.current) {
      coreLightRef.current.intensity = 0.1 + Math.sin(t * 0.6) * 0.02
    }

    // ── Neural shell rotation + mouse distortion (desktop) ──
    if (shellRef.current && outerOriginal.current) {
      shellRef.current.rotation.y = t * 0.015
      shellRef.current.rotation.x = Math.sin(t * 0.12) * 0.02
      const mat = shellRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = hovered ? 0.16 : 0.06
      mat.emissiveIntensity = hovered ? 0.2 : 0.07
      if (!lowTier) {
        const posAttr = shellRef.current.geometry.attributes.position as THREE.BufferAttribute
        const orig = outerOriginal.current
        const mouse = mouseWorldPos.current
        const distortStrength = hovered ? 0.35 : 0
        for (let i = 0; i < posAttr.count; i++) {
          const ox = orig[i * 3]
          const oy = orig[i * 3 + 1]
          const oz = orig[i * 3 + 2]
          _vertPos.set(ox, oy + 0.3, oz)
          const dist = _vertPos.distanceTo(mouse)
          if (dist < 2.2 && distortStrength > 0) {
            const influence = 1 - dist / 2.2
            const push = influence * influence * distortStrength
            _dir.set(ox, oy, oz).normalize()
            posAttr.setXYZ(i, ox + _dir.x * push, oy + _dir.y * push, oz + _dir.z * push)
          } else {
            const cx = posAttr.getX(i)
            const cy = posAttr.getY(i)
            const cz = posAttr.getZ(i)
            posAttr.setXYZ(i, cx + (ox - cx) * 0.08, cy + (oy - cy) * 0.08, cz + (oz - cz) * 0.08)
          }
        }
        posAttr.needsUpdate = true
      }
    }
    if (innerShellRef.current) {
      innerShellRef.current.rotation.y = -t * 0.02
      innerShellRef.current.rotation.z = Math.sin(t * 0.1) * 0.015
      const mat = innerShellRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = hovered ? 0.1 : 0.035
      mat.emissiveIntensity = hovered ? 0.14 : 0.05
    }
  })

  // ── Surface detail ──────────────────────────────────────────
  // Real machined metal never has a uniform highlight. These procedural maps
  // (drawn once into a canvas, no downloads) give the light something to break
  // on: brushed grain, wear patches, scratches.
  const detail = useMemo(() => {
    if (lowTier) {
      return {
        roughnessMap: brushedRoughness(256, 3),
        normalMap: microNormal(256, 3, 1.2),
        grime: grimeMap(128, 2),
        normalScale: new THREE.Vector2(0.35, 0.35),
      }
    }
    return {
      roughnessMap: brushedRoughness(512, 3),
      normalMap: microNormal(512, 3, 1.6),
      grime: grimeMap(256, 2),
      normalScale: new THREE.Vector2(0.55, 0.55),
    }
  }, [lowTier])

  // ── Shared arm materials ──
  const armBody = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#0c0d13',
        metalness: 0.94,
        roughness: 0.32,
        roughnessMap: detail.roughnessMap,
        normalMap: detail.normalMap,
        normalScale: detail.normalScale,
        envMapIntensity: 2.1,
        clearcoat: 0.55,
        clearcoatRoughness: 0.22,
      }),
    [detail]
  )

  // Lighter machined alloy for the hardware that catches the key light.
  const armAccent = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#1a1d26',
        metalness: 1,
        roughness: 0.19,
        roughnessMap: detail.roughnessMap,
        normalMap: detail.normalMap,
        normalScale: detail.normalScale,
        envMapIntensity: 2.6,
        clearcoat: 0.7,
        clearcoatRoughness: 0.14,
      }),
    [detail]
  )
  const jointRing = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d4a853',
        emissive: '#d4a853',
        emissiveIntensity: 0.5,
        toneMapped: false,
      }),
    []
  )

  return (
    <group position={[0, 0, 0]}>
      {/* ═══ CHASSIS — the machine bed ═══
          Bevelled, not a raw box: the chamfer is what catches the key light and
          separates "machined object" from "primitive". */}
      <RoundedBox args={[4.2, 0.5, 2.2]} radius={0.035} smoothness={3} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#050508"
          metalness={0.96}
          roughness={0.24}
          roughnessMap={detail.roughnessMap}
          normalMap={detail.normalMap}
          normalScale={detail.normalScale}
          envMapIntensity={2.4}
          clearcoat={0.6}
          clearcoatRoughness={0.14}
        />
      </RoundedBox>

      {/* Glossy top face — the working surface, kept sharper than the body */}
      <mesh position={[0, 0.251, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.14, 2.14]} />
        <meshPhysicalMaterial
          color="#07080e"
          metalness={0.92}
          roughness={0.16}
          roughnessMap={detail.roughnessMap}
          normalMap={detail.normalMap}
          normalScale={new THREE.Vector2(0.25, 0.25)}
          clearcoat={1}
          clearcoatRoughness={0.06}
          envMapIntensity={1.9}
        />
      </mesh>

      {/* ── Panel lines: shallow inset seams across the deck.
             Cheap and readable at any size, so phones get them too. ── */}
      {[-1.62, -0.55, 0.55, 1.62].map((x) => (
          <mesh key={`seam-${x}`} position={[x, 0.2525, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.012, 2.06]} />
            <meshStandardMaterial color="#000004" metalness={0.6} roughness={0.85} />
          </mesh>
      ))}

      {/* ── Fastener rows along the chassis shoulders ── */}
      {!lowTier &&
        Array.from({ length: 14 }, (_, i) => {
          const x = -1.95 + i * 0.3
          return [0.92, -0.92].map((z) => (
            <mesh key={`bolt-${i}-${z}`} position={[x, 0.2535, z]} material={armAccent}>
              <cylinderGeometry args={[0.016, 0.016, 0.008, 8]} />
            </mesh>
          ))
        })}

      {/* ── Side vent slats — silhouette detail on the long faces ── */}
      {Array.from({ length: 9 }, (_, i) => {
          const x = -1.1 + i * 0.275
          return [1.101, -1.101].map((z) => (
            <mesh key={`vent-${i}-${z}`} position={[x, -0.06, z]} material={armAccent}>
              <boxGeometry args={[0.16, 0.16, 0.012]} />
            </mesh>
          ))
        })}

      {/* Amber brand strip — front */}
      <mesh ref={glowRef} position={[0, 0, 1.112]}>
        <boxGeometry args={[4.0, 0.06, 0.02]} />
        <meshStandardMaterial
          color="#d4a853"
          emissive="#d4a853"
          emissiveIntensity={0.3}
          toneMapped={false}
        />
      </mesh>
      {/* Rear strip */}
      <mesh position={[0, 0, -1.112]}>
        <boxGeometry args={[4.0, 0.06, 0.02]} />
        <meshStandardMaterial
          color="#d4a853"
          emissive="#d4a853"
          emissiveIntensity={0.24}
          toneMapped={false}
        />
      </mesh>
      {/* White side strips */}
      <mesh position={[2.112, 0, 0]}>
        <boxGeometry args={[0.02, 0.04, 2.0]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.11} toneMapped={false} />
      </mesh>
      <mesh position={[-2.112, 0, 0]}>
        <boxGeometry args={[0.02, 0.04, 2.0]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.11} toneMapped={false} />
      </mesh>

      {/* ═══ INTAKE TRAY (chaos) — subtle recessed rim ═══ */}
      <mesh position={[PILE_CENTER.x, CHASSIS_TOP + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.52, 0.55, 40]} />
        <meshStandardMaterial
          color="#d4a853"
          emissive="#d4a853"
          emissiveIntensity={0.18}
          transparent
          opacity={0.55}
          toneMapped={false}
        />
      </mesh>

      {/* ═══ OUTPUT GRID (order) — 3×3 cells ═══ */}
      {Array.from({ length: CHIT_COUNT }, (_, i) => {
        const p = gridPos(i)
        return (
          <group key={`cell-${i}`}>
            {/* dark cell plate */}
            <mesh position={[p.x, CHASSIS_TOP + 0.004, p.z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.28, 0.22]} />
              <meshStandardMaterial color="#03030a" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* glowing cell frame */}
            <mesh
              ref={(el) => { cellRefs.current[i] = el }}
              position={[p.x, CHASSIS_TOP + 0.006, p.z]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <ringGeometry args={[0.13, 0.15, 4, 1, Math.PI / 4]} />
              <meshStandardMaterial
                color="#d4a853"
                emissive="#d4a853"
                emissiveIntensity={0.05}
                transparent
                opacity={0.9}
                toneMapped={false}
              />
            </mesh>
          </group>
        )
      })}

      {/* ═══ CHITS — the paperwork ═══ */}
      {Array.from({ length: CHIT_COUNT }, (_, i) => (
        <mesh
          key={`chit-${i}`}
          ref={(el) => { chitRefs.current[i] = el }}
          position={[
            PILE_CENTER.x + PILE_OFFSETS[i][0],
            CHIT_Y + PILE_OFFSETS[i][1],
            PILE_CENTER.z + PILE_OFFSETS[i][2],
          ]}
          rotation={[0, PILE_ROTATIONS[i], 0]}
        >
          <boxGeometry args={[0.18, 0.012, 0.13]} />
          <meshStandardMaterial
            color="#e9e6dd"
            emissive="#ffffff"
            emissiveIntensity={0.32}
            transparent
            opacity={1}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* ═══ THE ARM ═══ */}
      <group ref={turretRef} position={[0, CHASSIS_TOP, 0]}>
        {/* turret base */}
        <mesh position={[0, 0.07, 0]} material={armBody}>
          <cylinderGeometry args={[0.3, 0.34, 0.14, 32]} />
        </mesh>
        {/* machined collar + fastener ring around the base */}
        {!lowTier && (
          <>
            <mesh position={[0, 0.142, 0]} material={armAccent}>
              <cylinderGeometry args={[0.285, 0.285, 0.014, 32]} />
            </mesh>
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2
              return (
                <mesh
                  key={`tbolt-${i}`}
                  position={[Math.cos(a) * 0.255, 0.152, Math.sin(a) * 0.255]}
                  material={armAccent}
                >
                  <cylinderGeometry args={[0.012, 0.012, 0.008, 6]} />
                </mesh>
              )
            })}
          </>
        )}
        <mesh position={[0, 0.145, 0]} material={jointRing}>
          <torusGeometry args={[0.24, 0.012, 10, 40]} />
        </mesh>
        {/* column */}
        <mesh position={[0, 0.28, 0]} material={armBody}>
          <cylinderGeometry args={[0.11, 0.14, 0.3, 24]} />
        </mesh>
        {/* cable conduit running up the column */}
        {!lowTier && (
          <mesh position={[0.13, 0.28, 0]} rotation={[0, 0, 0.06]} material={armAccent}>
            <cylinderGeometry args={[0.018, 0.018, 0.3, 8]} />
          </mesh>
        )}

        {/* shoulder */}
        <group ref={shoulderRef} position={[0, 0.46, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={armBody}>
            <cylinderGeometry args={[0.11, 0.11, 0.22, 24]} />
          </mesh>
          {/* shoulder housing plate */}
          {!lowTier && (
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.112]} material={armAccent}>
              <cylinderGeometry args={[0.095, 0.095, 0.016, 20]} />
            </mesh>
          )}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.115]} material={jointRing}>
            <torusGeometry args={[0.08, 0.01, 8, 32]} />
          </mesh>
          {/* upper arm */}
          <mesh position={[L1 / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={armBody}>
            <capsuleGeometry args={[0.065, L1 - 0.12, 6, 16]} />
          </mesh>

          {/* elbow */}
          <group ref={elbowRef} position={[L1, 0, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={armBody}>
              <cylinderGeometry args={[0.08, 0.08, 0.18, 20]} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.095]} material={jointRing}>
              <torusGeometry args={[0.06, 0.008, 8, 28]} />
            </mesh>
            {/* forearm */}
            <mesh position={[(L2 - 0.14) / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={armBody}>
              <capsuleGeometry args={[0.05, L2 - 0.26, 6, 14]} />
            </mesh>

            {/* wrist + gripper */}
            <group ref={wristRef} position={[L2 - 0.14, 0, 0]}>
              <mesh material={armBody}>
                <cylinderGeometry args={[0.05, 0.06, 0.1, 16]} />
              </mesh>
              <mesh position={[0, -0.04, 0]} material={jointRing}>
                <torusGeometry args={[0.045, 0.007, 8, 24]} />
              </mesh>
              {/* fingers */}
              <mesh ref={gripLRef} position={[0.075, -0.1, 0]} material={armBody}>
                <boxGeometry args={[0.018, 0.1, 0.05]} />
              </mesh>
              <mesh ref={gripRRef} position={[-0.075, -0.1, 0]} material={armBody}>
                <boxGeometry args={[0.018, 0.1, 0.05]} />
              </mesh>
              {/* gripper tip anchor (world-position sampled for the carried chit) */}
              <object3D ref={tipRef} position={[0, -0.14, 0]} />
            </group>
          </group>
        </group>
      </group>

      {/* Pickup / placement beam */}
      <mesh ref={beamRef}>
        <cylinderGeometry args={[0.035, 0.06, 1, 12, 1, true]} />
        <meshBasicMaterial
          color="#d4a853"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ═══ NEURAL SHELLS — kept, enlarged to enclose the machine ═══ */}
      <mesh
        ref={shellRef}
        geometry={outerGeo}
        position={[0, 0.3, 0]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <meshStandardMaterial
          color="#b0b0b0"
          emissive="#ffffff"
          emissiveIntensity={0.12}
          wireframe
          transparent
          opacity={0.06}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={innerShellRef} geometry={innerGeo} position={[0, 0.3, 0]}>
        <meshStandardMaterial
          color="#909090"
          emissive="#cccccc"
          emissiveIntensity={0.08}
          wireframe
          transparent
          opacity={0.035}
          toneMapped={false}
        />
      </mesh>

      {/* Core light */}
      <pointLight
        ref={coreLightRef}
        position={[0, 0.6, 0]}
        color="#d4a853"
        intensity={0.1}
        distance={4.5}
        decay={2}
      />
    </group>
  )
}
