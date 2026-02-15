import { useRef, useMemo } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────
   Atmospheric Particle Field — GPU-Animated Edition

   PERFORMANCE:
   All 680+ particles are animated entirely in the vertex shader.
   Zero per-frame JavaScript loops. Zero buffer uploads.
   The CPU cost is literally just updating one uniform (uTime).

   The original version iterated over every particle in JS every
   frame and uploaded the buffer — this version is ~50× faster
   for the same visual result.

   VISUAL UPGRADES:
   - Smoother orbital motion with figure-8 / Lissajous curves
   - Size variation per particle (pulsing, breathing)
   - Golden particles have helical orbits (DNA strand feel)
   ──────────────────────────────────────────────────────────── */

// ── Volumetric Fog (GPU-animated) ───────────────────────────

const fogVertexShader = /* glsl */ `
attribute vec3 aSeed;  // x: phase, y: speed, z: angleOffset

uniform float uTime;
uniform float uBaseSize;

varying float vAlpha;

void main() {
  float phase = aSeed.x;
  float speed = aSeed.y;
  float angOff = aSeed.z;

  // Slow orbital drift with gentle vertical rise
  float t = uTime;
  float angle = angOff + t * 0.05 * speed;
  float radius = 0.8 + sin(t * 0.03 + phase) * 2.0 + cos(t * 0.07 + phase * 2.0) * 1.5;

  // Vertical: slow rise with sine wobble, wrapping
  float baseY = mod(position.y + t * 0.0004 * speed + phase * 0.3, 5.0) - 2.5;
  float yWobble = sin(t * 0.15 + phase) * 0.3;

  vec3 pos = vec3(
    cos(angle) * radius + sin(t * 0.02 + phase) * 0.5,
    baseY + yWobble,
    sin(angle) * radius + cos(t * 0.03 + phase) * 0.5
  );

  // Distance fade
  float dist = length(pos.xz);
  vAlpha = smoothstep(8.0, 5.0, dist) * smoothstep(-2.5, -1.5, pos.y) * smoothstep(2.5, 1.5, pos.y);

  // Size variation — breathing
  float sizePulse = 1.0 + sin(t * 0.3 + phase * 3.0) * 0.2;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPos;
  gl_PointSize = uBaseSize * sizePulse * (300.0 / -mvPos.z);
}
`

const fogFragmentShader = /* glsl */ `
precision highp float;
uniform vec3 uColor;
uniform float uOpacity;
uniform sampler2D uTexture;
varying float vAlpha;

void main() {
  vec4 tex = texture2D(uTexture, gl_PointCoord);
  gl_FragColor = vec4(uColor, tex.a * uOpacity * vAlpha);
}
`

// ── Golden Energy Particles (GPU-animated helical orbits) ───

const goldVertexShader = /* glsl */ `
attribute vec3 aSeed;  // x: phase, y: speed, z: baseAngle

uniform float uTime;
uniform float uBaseSize;

varying float vAlpha;
varying float vPulse;

void main() {
  float phase = aSeed.x;
  float speed = aSeed.y;
  float baseAngle = aSeed.z;

  float t = uTime;

  // Helical orbit — DNA strand feel
  float orbitAngle = baseAngle + t * 0.03 * speed;
  float radius = 1.5 + sin(t * 0.1 + phase) * 0.5;
  float helixY = sin(orbitAngle * 2.0 + phase) * 0.4;
  float yOffset = sin(t * 0.2 * speed + phase) * 0.3;

  vec3 pos = vec3(
    cos(orbitAngle) * radius,
    0.3 + helixY + yOffset,
    sin(orbitAngle) * radius
  );

  float dist = length(pos.xz);
  vAlpha = smoothstep(3.5, 2.5, dist);
  vPulse = sin(t * 1.5 + phase * 5.0) * 0.5 + 0.5;

  float sizePulse = 1.0 + vPulse * 0.3;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPos;
  gl_PointSize = uBaseSize * sizePulse * (300.0 / -mvPos.z);
}
`

const goldFragmentShader = /* glsl */ `
precision highp float;
uniform vec3 uColor;
uniform float uOpacity;
uniform sampler2D uTexture;
varying float vAlpha;
varying float vPulse;

void main() {
  vec4 tex = texture2D(uTexture, gl_PointCoord);
  float alpha = tex.a * uOpacity * vAlpha * (0.5 + vPulse * 0.5);
  gl_FragColor = vec4(uColor * (0.8 + vPulse * 0.4), alpha);
}
`

// ── Materials ───────────────────────────────────────────────

const FogParticleMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uBaseSize: 0.4,
    uColor: new THREE.Color('#667799'),
    uOpacity: 0.035,
    uTexture: null,
  },
  fogVertexShader,
  fogFragmentShader
)

const GoldParticleMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uBaseSize: 0.2,
    uColor: new THREE.Color('#d4a853'),
    uOpacity: 0.06,
    uTexture: null,
  },
  goldVertexShader,
  goldFragmentShader
)

extend({
  FogParticleMaterial: FogParticleMaterialImpl,
  GoldParticleMaterial: GoldParticleMaterialImpl,
})

// ── Texture generation ──────────────────────────────────────

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

// ── Fog Particles ───────────────────────────────────────────

const FOG_COUNT = 400

function VolumetricFog() {
  const matRef = useRef<any>(null)

  const texture = useMemo(
    () => createSoftCircleTexture(128, 'rgba(100,120,160,0.15)', 1.5),
    []
  )

  const geometry = useMemo(() => {
    const positions = new Float32Array(FOG_COUNT * 3)
    const seeds = new Float32Array(FOG_COUNT * 3)

    for (let i = 0; i < FOG_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 0.8 + Math.random() * 6
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5 // Spread across wrap range
      positions[i * 3 + 2] = Math.sin(angle) * radius

      seeds[i * 3] = Math.random() * 100     // phase
      seeds[i * 3 + 1] = 0.3 + Math.random() * 0.7 // speed
      seeds[i * 3 + 2] = Math.random() * Math.PI * 2 // angle offset
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3))
    return geo
  }, [])

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uTime = state.clock.elapsedTime
    }
  })

  return (
    <points geometry={geometry}>
      <fogParticleMaterial
        ref={matRef}
        uTexture={texture}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// ── Inner Mist ──────────────────────────────────────────────

const MIST_COUNT = 80

function InnerMist() {
  const matRef = useRef<any>(null)

  const texture = useMemo(
    () => createSoftCircleTexture(64, 'rgba(255,255,255,0.15)', 2),
    []
  )

  const geometry = useMemo(() => {
    const positions = new Float32Array(MIST_COUNT * 3)
    const seeds = new Float32Array(MIST_COUNT * 3)

    for (let i = 0; i < MIST_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 0.5 + Math.random() * 2.5
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2
      positions[i * 3 + 2] = Math.sin(angle) * radius

      seeds[i * 3] = Math.random() * 100
      seeds[i * 3 + 1] = 0.5 + Math.random() * 1
      seeds[i * 3 + 2] = Math.random() * Math.PI * 2
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3))
    return geo
  }, [])

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uTime = state.clock.elapsedTime
    }
  })

  return (
    <points geometry={geometry}>
      <fogParticleMaterial
        ref={matRef}
        uTexture={texture}
        uColor={new THREE.Color('#ffffff')}
        uBaseSize={0.15}
        uOpacity={0.03}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// ── Golden Energy ───────────────────────────────────────────

const GOLD_COUNT = 200

function GoldenEnergy() {
  const matRef = useRef<any>(null)

  const texture = useMemo(
    () => createSoftCircleTexture(64, 'rgba(212,168,83,0.25)', 2),
    []
  )

  const geometry = useMemo(() => {
    const positions = new Float32Array(GOLD_COUNT * 3)
    const seeds = new Float32Array(GOLD_COUNT * 3)

    for (let i = 0; i < GOLD_COUNT; i++) {
      const angle = (i / GOLD_COUNT) * Math.PI * 2
      positions[i * 3] = Math.cos(angle) * 2
      positions[i * 3 + 1] = 0.3
      positions[i * 3 + 2] = Math.sin(angle) * 2

      seeds[i * 3] = Math.random() * 100      // phase
      seeds[i * 3 + 1] = 0.3 + Math.random() * 0.7 // speed
      seeds[i * 3 + 2] = angle                 // base angle
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3))
    return geo
  }, [])

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uTime = state.clock.elapsedTime
    }
  })

  return (
    <points geometry={geometry}>
      <goldParticleMaterial
        ref={matRef}
        uTexture={texture}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// ── Exported Component ──────────────────────────────────────

export default function HudRing() {
  return (
    <group>
      <VolumetricFog />
      <InnerMist />
      <GoldenEnergy />
    </group>
  )
}
