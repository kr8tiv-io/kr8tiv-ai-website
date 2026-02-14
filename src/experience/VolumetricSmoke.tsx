import { useRef, useMemo } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────
   Raymarched Volumetric Smoke — Wave Edition

   Physically-based volumetric fog with directional wave system.
   Uses 3D simplex noise FBM, sweeping sine wave modulation,
   Beer-Lambert absorption, Henyey-Greenstein phase function,
   and volumetric self-shadowing.
   ──────────────────────────────────────────────────────────── */

const NUM_STEPS = 40
const SHADOW_STEPS = 3

// ── Vertex Shader ───────────────────────────────────────────

const vertexShader = /* glsl */ `
varying vec3 vWorldPos;

void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

// ── Fragment Shader ─────────────────────────────────────────

const fragmentShader = /* glsl */ `
precision highp float;

varying vec3 vWorldPos;

uniform float uTime;
uniform vec3 uBoxMin;
uniform vec3 uBoxMax;
uniform vec3 uWindDirection;
uniform float uWindSpeed;
uniform float uDensityMultiplier;
uniform float uAbsorption;
uniform vec3 uLightDir;
uniform vec3 uLightColor;
uniform float uLightIntensity;
uniform float uPhaseG;
uniform float uNoiseScale;
uniform float uDensityThreshold;

#define NUM_STEPS ${NUM_STEPS}
#define SHADOW_STEPS ${SHADOW_STEPS}
#define PI 3.14159265359

/* ── Simplex 3D Noise (ashima/webgl-noise, MIT license) ──── */

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
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

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x2_ = x_ * ns.x + ns.yyyy;
  vec4 y2_ = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x2_) - abs(y2_);

  vec4 b0 = vec4(x2_.xy, y2_.xy);
  vec4 b1 = vec4(x2_.zw, y2_.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

/* ── FBM with per-octave wind (4 octaves for enhanced detail) */

float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  vec3 wind = uWindDirection * uTime * uWindSpeed;

  for (int i = 0; i < 4; i++) {
    vec3 offset = wind * (0.4 + float(i) * 0.35);
    value += amplitude * snoise((p + offset) * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}

/* ── Jitter hash (screen-space blue-noise approximation) ─── */

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

/* ── Ray-AABB intersection (slab method) ─────────────────── */

vec2 intersectAABB(vec3 ro, vec3 rd, vec3 bmin, vec3 bmax) {
  vec3 invDir = 1.0 / rd;
  vec3 t0 = (bmin - ro) * invDir;
  vec3 t1 = (bmax - ro) * invDir;
  vec3 tmin = min(t0, t1);
  vec3 tmax = max(t0, t1);
  float tNear = max(max(tmin.x, tmin.y), tmin.z);
  float tFar = min(min(tmax.x, tmax.y), tmax.z);
  return vec2(tNear, tFar);
}

/* ── Henyey-Greenstein phase function ────────────────────── */

float henyeyGreenstein(float cosTheta, float g) {
  float g2 = g * g;
  float denom = 1.0 + g2 - 2.0 * g * cosTheta;
  return (1.0 - g2) / (4.0 * PI * pow(denom, 1.5));
}

/* ── Density sampling with sweeping wave system ──────────── */

float sampleDensity(vec3 worldPos) {
  vec3 samplePos = worldPos * uNoiseScale;

  // FBM density field
  float density = fbm(samplePos);

  // Remap: threshold + smooth falloff
  density = smoothstep(uDensityThreshold, uDensityThreshold + 0.3, density * 0.5 + 0.5);

  // ── Sweeping wave system ──
  // Primary wave — slow, majestic, defines the main flow
  float wavePhase1 = worldPos.x * 1.0 + worldPos.z * 0.3 + uTime * 0.3;
  float wave1 = sin(wavePhase1) * 0.5 + 0.5;
  wave1 = pow(wave1, 0.7); // Sharpen crests

  // Secondary wave — different angle and speed
  float wavePhase2 = worldPos.x * 2.2 - worldPos.z * 0.8 + uTime * 0.45;
  float wave2 = sin(wavePhase2) * 0.3 + 0.7;

  // Cross-wave — perpendicular for organic interference
  float wavePhase3 = worldPos.z * 1.5 + worldPos.x * 0.4 + uTime * 0.2;
  float wave3 = sin(wavePhase3) * 0.2 + 0.8;

  // Combine: flowing rivers of density
  float waveMask = wave1 * wave2 * wave3;

  // Gentle pulsation — breathing rhythm
  float pulse = sin(uTime * 0.6) * 0.08 + 0.92;
  waveMask *= pulse;

  density *= waveMask;

  // ── Boundary fades ──
  vec3 center = (uBoxMin + uBoxMax) * 0.5;
  vec3 halfSize = (uBoxMax - uBoxMin) * 0.5;
  vec3 d = abs(worldPos - center) / halfSize;

  // Edge fade — tight to prevent blotch at far camera
  float edgeFade = 1.0 - smoothstep(0.25, 0.78, max(max(d.x, d.y), d.z));

  // Height gradient — wider band for taller volume
  float normalizedY = (worldPos.y - uBoxMin.y) / (uBoxMax.y - uBoxMin.y);
  float heightFade = smoothstep(0.0, 0.2, normalizedY) * smoothstep(1.0, 0.35, normalizedY);

  // Radial fade — generous spread
  float radialDist = length(worldPos.xz - center.xz) / halfSize.x;
  float radialFade = 1.0 - smoothstep(0.35, 0.92, radialDist);

  return density * edgeFade * heightFade * radialFade * uDensityMultiplier;
}

/* ── Volumetric self-shadowing ───────────────────────────── */

float volumetricShadow(vec3 pos) {
  float shadowDensity = 0.0;
  float shadowStepSize = 1.0 / float(SHADOW_STEPS);

  for (int j = 0; j < SHADOW_STEPS; j++) {
    pos += uLightDir * shadowStepSize;
    shadowDensity += sampleDensity(pos) * shadowStepSize;
  }

  return exp(-shadowDensity * uAbsorption * 2.0);
}

/* ── Main ────────────────────────────────────────────────── */

void main() {
  vec3 ro = cameraPosition;
  vec3 rd = normalize(vWorldPos - cameraPosition);

  // Ray-AABB intersection
  vec2 t = intersectAABB(ro, rd, uBoxMin, uBoxMax);
  t.x = max(t.x, 0.0);
  if (t.x >= t.y) discard;

  float stepSize = (t.y - t.x) / float(NUM_STEPS);

  // Jittered start to eliminate banding
  float jitter = hash(gl_FragCoord.xy + fract(uTime * 0.17)) * stepSize;

  float transmittance = 1.0;
  vec3 scattered = vec3(0.0);

  for (int i = 0; i < NUM_STEPS; i++) {
    float tCur = t.x + (float(i) + 0.5) * stepSize + jitter;
    if (tCur > t.y) break;

    vec3 pos = ro + rd * tCur;
    float density = sampleDensity(pos);

    if (density > 0.001) {
      float extinction = density * uAbsorption;
      float stepTrans = exp(-extinction * stepSize);

      // In-scattering with phase function and self-shadowing
      float cosTheta = dot(uLightDir, rd);
      float phase = henyeyGreenstein(cosTheta, uPhaseG);
      float shadow = volumetricShadow(pos);

      vec3 luminance = uLightColor * uLightIntensity * phase * shadow;

      // Energy-conserving integration (SebH formulation)
      vec3 integScatter = luminance * (1.0 - stepTrans) / max(extinction, 0.0001);
      scattered += transmittance * integScatter;
      transmittance *= stepTrans;

      // Early termination — fully opaque
      if (transmittance < 0.01) break;
    }
  }

  // Ambient contribution — warm-cool gradient for cinematic depth
  float ambientDensity = 1.0 - transmittance;
  vec3 warmAmb = vec3(0.08, 0.07, 0.06);
  vec3 coolAmb = vec3(0.06, 0.07, 0.10);
  scattered += mix(warmAmb, coolAmb, 0.5) * ambientDensity * 0.7;

  gl_FragColor = vec4(scattered, 1.0 - transmittance);
}
`

// ── Material Definition ─────────────────────────────────────

const VolumetricSmokeMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uBoxMin: new THREE.Vector3(-4, -0.75, -4),
    uBoxMax: new THREE.Vector3(4, 2.75, 4),
    uWindDirection: new THREE.Vector3(1, 0.08, 0.25).normalize(),
    uWindSpeed: 0.22,
    uDensityMultiplier: 0.28,
    uAbsorption: 0.38,
    uLightDir: new THREE.Vector3(5, 8, 3).normalize(),
    uLightColor: new THREE.Vector3(1.0, 0.97, 0.92),
    uLightIntensity: 1.8,
    uPhaseG: 0.25,
    uNoiseScale: 2.0,
    uDensityThreshold: 0.35,
  },
  vertexShader,
  fragmentShader
)

extend({ VolumetricSmokeMaterial: VolumetricSmokeMaterialImpl })

// ── Volume dimensions ───────────────────────────────────────

const VOL_POS: [number, number, number] = [0, 1.0, 0]
const VOL_SCALE: [number, number, number] = [8, 3.5, 8]

// ── Component ───────────────────────────────────────────────

export default function VolumetricSmoke() {
  const matRef = useRef<any>(null)

  // Compute world-space AABB from position + scale
  const { boxMin, boxMax } = useMemo(() => ({
    boxMin: new THREE.Vector3(
      VOL_POS[0] - VOL_SCALE[0] / 2,
      VOL_POS[1] - VOL_SCALE[1] / 2,
      VOL_POS[2] - VOL_SCALE[2] / 2
    ),
    boxMax: new THREE.Vector3(
      VOL_POS[0] + VOL_SCALE[0] / 2,
      VOL_POS[1] + VOL_SCALE[1] / 2,
      VOL_POS[2] + VOL_SCALE[2] / 2
    ),
  }), [])

  useFrame((state) => {
    if (!matRef.current) return
    matRef.current.uTime = state.clock.elapsedTime
    matRef.current.uBoxMin = boxMin
    matRef.current.uBoxMax = boxMax
  })

  return (
    <mesh position={VOL_POS} scale={VOL_SCALE} renderOrder={1}>
      <boxGeometry args={[1, 1, 1]} />
      <volumetricSmokeMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
      />
    </mesh>
  )
}
