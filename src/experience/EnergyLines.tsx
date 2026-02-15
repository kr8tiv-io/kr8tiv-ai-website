import { useRef, useMemo } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────
   Energy Lines — Animated neural network energy pulses.

   Extracts edges from icosahedron and dodecahedron geometry,
   then renders them with a custom shader that sends bright
   pulses traveling along each edge — like data flowing through
   a living neural network.

   Multiple pulse waves at different speeds create a complex,
   organic pattern. On hover, pulse speed and brightness increase.

   This is the single highest-impact visual upgrade — it turns
   the static wireframe from "geometric wrapper" into something
   that looks alive and electric.
   ──────────────────────────────────────────────────────────── */

// ── Shader ──────────────────────────────────────────────────

const energyVertexShader = /* glsl */ `
attribute float aEdgeProgress;   // 0–1 along each edge segment
attribute float aEdgeIndex;      // unique per edge for phase offset
attribute float aEdgeLength;     // world-space edge length

varying float vProgress;
varying float vEdgeIndex;
varying float vEdgeLength;
varying vec3 vWorldPos;

void main() {
  vProgress = aEdgeProgress;
  vEdgeIndex = aEdgeIndex;
  vEdgeLength = aEdgeLength;

  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const energyFragmentShader = /* glsl */ `
precision highp float;

varying float vProgress;
varying float vEdgeIndex;
varying float vEdgeLength;
varying vec3 vWorldPos;

uniform float uTime;
uniform float uHoverIntensity; // 0 = idle, 1 = hovered
uniform vec3 uMouseWorld;

#define PI 3.14159265359

void main() {
  // ── Multiple pulse waves at different speeds ──

  // Primary pulse — slow, wide, majestic
  float wave1 = sin(vProgress * PI * 3.0 - uTime * 1.8 + vEdgeIndex * 1.7);
  wave1 = smoothstep(0.3, 1.0, wave1); // Only the peaks survive

  // Secondary pulse — faster, sharper, different phase
  float wave2 = sin(vProgress * PI * 5.0 + uTime * 2.8 - vEdgeIndex * 2.3);
  wave2 = smoothstep(0.6, 1.0, wave2) * 0.6; // Sharper, dimmer

  // Tertiary pulse — very fast, sparking
  float wave3 = sin(vProgress * PI * 9.0 - uTime * 5.5 + vEdgeIndex * 0.9);
  wave3 = smoothstep(0.85, 1.0, wave3) * 0.35; // Very sharp sparks

  float pulse = wave1 + wave2 + wave3;

  // ── Mouse proximity boost ──
  float mouseDist = length(vWorldPos - uMouseWorld);
  float mouseBoost = exp(-mouseDist * 0.8) * 1.5;

  // ── Hover amplification ──
  float hoverMult = 1.0 + uHoverIntensity * 2.5;
  pulse *= hoverMult;
  pulse += mouseBoost * uHoverIntensity;

  // ── Color: white base → golden on pulse ──
  vec3 baseColor = vec3(0.4, 0.4, 0.45); // Cool grey idle
  vec3 pulseColor = vec3(1.0, 0.88, 0.55); // Warm gold pulse
  vec3 sparkColor = vec3(1.0, 1.0, 1.0);   // Pure white sparks

  vec3 color = mix(baseColor, pulseColor, min(pulse, 1.0));
  color = mix(color, sparkColor, smoothstep(0.8, 1.5, pulse));

  // ── Alpha: dim base, bright on pulse ──
  float baseAlpha = 0.04 + uHoverIntensity * 0.06;
  float alpha = baseAlpha + pulse * 0.5;
  alpha = min(alpha, 0.85);

  // Edge endpoints fade to prevent hard cuts
  float endFade = smoothstep(0.0, 0.08, vProgress) * smoothstep(1.0, 0.92, vProgress);
  alpha *= endFade;

  gl_FragColor = vec4(color, alpha);
}
`

// ── Material Definition ─────────────────────────────────────

const EnergyLineMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uHoverIntensity: 0,
    uMouseWorld: new THREE.Vector3(0, 0, 0),
  },
  energyVertexShader,
  energyFragmentShader
)

extend({ EnergyLineMaterial: EnergyLineMaterialImpl })

// ── Edge extraction and subdivision ─────────────────────────

/**
 * Extracts edges from a geometry and subdivides each edge into
 * multiple segments to allow smooth per-vertex shader animation.
 * Returns positions + custom attributes for the energy shader.
 */
function buildEnergyEdges(
  sourceGeo: THREE.BufferGeometry,
  subdivisions: number = 6
): {
  positions: Float32Array
  edgeProgress: Float32Array
  edgeIndex: Float32Array
  edgeLength: Float32Array
} {
  const edgesGeo = new THREE.EdgesGeometry(sourceGeo)
  const posAttr = edgesGeo.attributes.position as THREE.BufferAttribute
  const edgeCount = posAttr.count / 2

  // Each edge becomes (subdivisions + 1) vertices × 2 (for line segments)
  const segsPerEdge = subdivisions
  const totalVerts = edgeCount * (segsPerEdge + 1)

  const positions = new Float32Array(totalVerts * 3)
  const edgeProgress = new Float32Array(totalVerts)
  const edgeIndex = new Float32Array(totalVerts)
  const edgeLength = new Float32Array(totalVerts)

  const a = new THREE.Vector3()
  const b = new THREE.Vector3()

  let writeIdx = 0

  for (let e = 0; e < edgeCount; e++) {
    a.fromBufferAttribute(posAttr, e * 2)
    b.fromBufferAttribute(posAttr, e * 2 + 1)

    const len = a.distanceTo(b)
    const eidx = e * 1.618 // Golden ratio spacing for varied phase

    for (let s = 0; s <= segsPerEdge; s++) {
      const t = s / segsPerEdge

      positions[writeIdx * 3] = a.x + (b.x - a.x) * t
      positions[writeIdx * 3 + 1] = a.y + (b.y - a.y) * t
      positions[writeIdx * 3 + 2] = a.z + (b.z - a.z) * t

      edgeProgress[writeIdx] = t
      edgeIndex[writeIdx] = eidx
      edgeLength[writeIdx] = len

      writeIdx++
    }
  }

  edgesGeo.dispose()

  return { positions, edgeProgress, edgeIndex, edgeLength }
}

// ── Build index buffer for line segments from subdivided edges ──

function buildLineIndices(edgeCount: number, subdivisions: number): Uint32Array {
  const segsPerEdge = subdivisions
  const vertsPerEdge = segsPerEdge + 1
  const indices: number[] = []

  for (let e = 0; e < edgeCount; e++) {
    const base = e * vertsPerEdge
    for (let s = 0; s < segsPerEdge; s++) {
      indices.push(base + s, base + s + 1)
    }
  }

  return new Uint32Array(indices)
}

// ── Props ───────────────────────────────────────────────────

interface EnergyLinesProps {
  hovered: boolean
  mouseWorldPos: THREE.Vector3
}

// ── Component ───────────────────────────────────────────────

export default function EnergyLines({ hovered, mouseWorldPos }: EnergyLinesProps) {
  const outerRef = useRef<THREE.LineSegments>(null)
  const innerRef = useRef<THREE.LineSegments>(null)
  const outerMatRef = useRef<any>(null)
  const innerMatRef = useRef<any>(null)

  const SUBDIVISIONS = 8

  // Build outer energy lines (icosahedron)
  const outerGeo = useMemo(() => {
    const source = new THREE.IcosahedronGeometry(2.2, 2)
    const edgesGeo = new THREE.EdgesGeometry(source)
    const edgeCount = edgesGeo.attributes.position.count / 2
    edgesGeo.dispose()

    const { positions, edgeProgress, edgeIndex, edgeLength } =
      buildEnergyEdges(source, SUBDIVISIONS)
    const indices = buildLineIndices(edgeCount, SUBDIVISIONS)

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aEdgeProgress', new THREE.BufferAttribute(edgeProgress, 1))
    geo.setAttribute('aEdgeIndex', new THREE.BufferAttribute(edgeIndex, 1))
    geo.setAttribute('aEdgeLength', new THREE.BufferAttribute(edgeLength, 1))
    geo.setIndex(new THREE.BufferAttribute(indices, 1))

    source.dispose()
    return geo
  }, [])

  // Build inner energy lines (dodecahedron)
  const innerGeo = useMemo(() => {
    const source = new THREE.DodecahedronGeometry(1.7, 1)
    const edgesGeo = new THREE.EdgesGeometry(source)
    const edgeCount = edgesGeo.attributes.position.count / 2
    edgesGeo.dispose()

    const { positions, edgeProgress, edgeIndex, edgeLength } =
      buildEnergyEdges(source, SUBDIVISIONS)
    const indices = buildLineIndices(edgeCount, SUBDIVISIONS)

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aEdgeProgress', new THREE.BufferAttribute(edgeProgress, 1))
    geo.setAttribute('aEdgeIndex', new THREE.BufferAttribute(edgeIndex, 1))
    geo.setAttribute('aEdgeLength', new THREE.BufferAttribute(edgeLength, 1))
    geo.setIndex(new THREE.BufferAttribute(indices, 1))

    source.dispose()
    return geo
  }, [])

  const hoverTarget = useRef(0)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    hoverTarget.current = THREE.MathUtils.lerp(
      hoverTarget.current,
      hovered ? 1 : 0,
      0.06
    )

    // Rotate with the wireframe shells
    if (outerRef.current) {
      outerRef.current.rotation.y = t * 0.015
      outerRef.current.rotation.x = Math.sin(t * 0.12) * 0.02
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.02
      innerRef.current.rotation.z = Math.sin(t * 0.1) * 0.015
    }

    // Update uniforms
    if (outerMatRef.current) {
      outerMatRef.current.uTime = t
      outerMatRef.current.uHoverIntensity = hoverTarget.current
      outerMatRef.current.uMouseWorld = mouseWorldPos
    }
    if (innerMatRef.current) {
      innerMatRef.current.uTime = t
      innerMatRef.current.uHoverIntensity = hoverTarget.current
      innerMatRef.current.uMouseWorld = mouseWorldPos
    }
  })

  return (
    <group position={[0, 0.3, 0]}>
      {/* Outer energy lines */}
      <lineSegments ref={outerRef} geometry={outerGeo}>
        <energyLineMaterial
          ref={outerMatRef}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </lineSegments>

      {/* Inner energy lines */}
      <lineSegments ref={innerRef} geometry={innerGeo}>
        <energyLineMaterial
          ref={innerMatRef}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  )
}
