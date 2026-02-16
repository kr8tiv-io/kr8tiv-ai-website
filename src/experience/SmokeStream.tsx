import { useRef, useMemo, useCallback } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────
   Smoke Stream — One Thick Volumetric Flow

   Instead of multiple thin ribbons, this creates ONE massive
   flowing volume by stacking ~18 semi-transparent planes at
   slightly different Z depths and phases. The visual result
   is a single coherent stream with internal layered fiber
   texture.

   Each layer is a wide plane with vertex wave displacement.
   Layers are staggered in Z and phase so the internal structure
   shifts as you look through it — creating volumetric depth.

   The stream flows horizontally, has a bright core, and
   fades to nothing at the edges and near the center (so text
   and the product stay readable).

   Performance: ~18 planes x 80 segments = ~1440 triangles total.
   Vertex shader does the heavy lifting. Very cheap.
   ──────────────────────────────────────────────────────────── */

const streamVertexShader = /* glsl */ `
uniform float uTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uPhase;
uniform float uLayerOffset;

varying vec2 vUv;
varying vec3 vWorldPos;

// Simple noise for organic variation
vec3 mod289v(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289v(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permutev(vec4 x) { return mod289v(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrtv(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289v(i);
  vec4 p = permutev(permutev(permutev(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x2v = x_ * ns.x + ns.yyyy;
  vec4 y2v = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x2v) - abs(y2v);
  vec4 b0 = vec4(x2v.xy, y2v.xy);
  vec4 b1 = vec4(x2v.zw, y2v.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrtv(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vUv = uv;
  vec3 pos = position;
  float t = uTime * uSpeed;

  // Each layer gets slightly different phase from uLayerOffset
  float layerPhase = uPhase + uLayerOffset * 0.4;

  // Primary wave — slow, deep, majestic
  float wave1 = sin(pos.x * 0.35 + t + layerPhase) * uAmplitude;

  // Secondary wave — creates the rolling feel
  float wave2 = sin(pos.x * 0.55 - t * 0.7 + layerPhase * 1.5) * uAmplitude * 0.35;

  // Noise — each layer gets different turbulence from its offset
  float noiseVal = snoise(vec3(
    pos.x * 0.12 + t * 0.08,
    uLayerOffset * 0.5,
    layerPhase * 0.3
  )) * 0.5;

  pos.y += wave1 + wave2 + noiseVal;

  // Z offset — layers spread in depth
  pos.z += uLayerOffset;

  vec4 wp = modelMatrix * vec4(pos, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const streamFragmentShader = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying vec3 vWorldPos;

uniform float uTime;
uniform float uPhase;
uniform float uOpacity;
uniform float uLayerOffset;

void main() {
  // ── Soft vertical gaussian — wide, dreamy falloff ──
  float distFromCenter = abs(vUv.y - 0.5) * 2.0;
  float gauss = exp(-distFromCenter * distFromCenter * 2.5);

  // ── Internal fiber texture — subtle contour lines ──
  float fiber = sin(vUv.y * 40.0 + uLayerOffset * 8.0 + uTime * 0.5) * 0.5 + 0.5;
  fiber = smoothstep(0.3, 0.7, fiber);
  float fiberEffect = 0.7 + fiber * 0.3;

  // ── Very slow brightness variation along length ──
  float lengthVar = sin(vUv.x * 4.0 - uTime * 0.8 + uPhase) * 0.5 + 0.5;
  lengthVar = 0.8 + lengthVar * 0.2;

  float intensity = gauss * fiberEffect * lengthVar;

  // ── Horizontal edge fade ──
  float edgeFade = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
  intensity *= edgeFade;

  // ── Center protection zone — wide fade so product + text stay clear ──
  float centerDist = length(vWorldPos.xz);
  float centerFade = smoothstep(3.5, 12.0, centerDist);
  intensity *= mix(0.005, 1.0, centerFade);

  // ── Pure white ──
  float alpha = intensity * uOpacity;

  gl_FragColor = vec4(vec3(1.0), alpha);
}
`

// ── Material ────────────────────────────────────────────────

const StreamLayerMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uSpeed: 0.3,
    uAmplitude: 0.8,
    uPhase: 0,
    uLayerOffset: 0,
    uOpacity: 0.04,
  },
  streamVertexShader,
  streamFragmentShader
)

extend({ StreamLayerMaterial: StreamLayerMaterialImpl })


// ── Configuration ───────────────────────────────────────────

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768

const LAYER_COUNT = IS_MOBILE ? 10 : 18        // Fewer layers on mobile
const LAYER_SPREAD = 3.0                        // Total Z-depth spread
const STREAM_LENGTH = 28                        // Horizontal span
const STREAM_HEIGHT = 5.0                       // Tall — this is one BIG stream
const STREAM_Y = 0.8                            // Vertical center
const SEGMENTS_X = IS_MOBILE ? 40 : 80          // Fewer segments on mobile

// ── Precomputed layer data ──────────────────────────────────

interface LayerData {
  index: number
  layerOffset: number
  layerOpacity: number
}

const LAYER_DATA: LayerData[] = Array.from({ length: LAYER_COUNT }, (_, i) => {
  const normalizedIndex = (i / (LAYER_COUNT - 1)) * 2 - 1
  const layerOffset = normalizedIndex * LAYER_SPREAD
  const depthFactor = 1.0 - Math.abs(normalizedIndex) * 0.4
  const layerOpacity = 0.018 * depthFactor
  return { index: i, layerOffset, layerOpacity }
})

// ── Single Layer (no useFrame — parent drives time) ─────────

function StreamLayer({ data, setRef }: { data: LayerData; setRef: (i: number, el: any) => void }) {
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(STREAM_LENGTH, STREAM_HEIGHT, SEGMENTS_X, 1)
  }, [])

  const refCb = useCallback((el: any) => setRef(data.index, el), [data.index, setRef])

  return (
    <mesh geometry={geometry} renderOrder={2}>
      <streamLayerMaterial
        ref={refCb}
        uSpeed={0.25}
        uAmplitude={0.9}
        uPhase={0}
        uLayerOffset={data.layerOffset}
        uOpacity={data.layerOpacity}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  )
}

// ── Exported Component — single useFrame for all layers ─────

export default function SmokeStream() {
  const matRefs = useRef<(any | null)[]>(new Array(LAYER_COUNT).fill(null))

  const setRef = useCallback((i: number, el: any) => {
    matRefs.current[i] = el
  }, [])

  // One useFrame instead of LAYER_COUNT separate hooks
  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < matRefs.current.length; i++) {
      const m = matRefs.current[i]
      if (m) m.uTime = t
    }
  })

  return (
    <group position={[0, STREAM_Y, 0]}>
      {LAYER_DATA.map((data) => (
        <StreamLayer key={data.index} data={data} setRef={setRef} />
      ))}
    </group>
  )
}
