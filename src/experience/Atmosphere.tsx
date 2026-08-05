import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { DeviceTier } from '../hooks/useDeviceCapability'

/* ─────────────────────────────────────────────────────────────
   Atmosphere — the fog you can actually see.

   Two families of cheap billboards, both driven by the same 3-octave
   fbm so they read as one body of air:

   - BANKS: camera-facing sheets standing around the machine. Additive,
     so they catch the light like haze in a beam.
   - GROUND: big horizontal planes lying just above the floor, normal
     blended, so the deck sits IN something rather than floating in black.

   Everything is 2 triangles and a small fbm — cheap enough to run on a
   phone, which is the point: the low tier gets the same look with fewer
   layers, not a different scene.
   ──────────────────────────────────────────────────────────── */

const fogVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const fogFragment = /* glsl */ `
precision mediump float;

varying vec2 vUv;
varying vec3 vWorldPos;

uniform float uTime;
uniform float uOpacity;
uniform float uScale;
uniform float uSpeed;
uniform float uSeed;
uniform float uEdge;      // how hard the sheet fades at its border
uniform float uCore;      // brightness of the lit core
uniform vec3  uColor;
uniform vec3  uCamPos;
uniform float uNearFade;  // metres of fade-out as the camera enters the sheet
uniform float uFarFade;   // distance at which the sheet dissolves again
uniform float uHoleRadius; // keeps the machine readable through the haze

// -- value noise + fbm (cheap: no permutation tables) --
float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
    f.z
  );
}

// Two octaves is all this reads at fog opacities, and fog is pure overdraw —
// the third octave cost real frames at 1440 for no visible gain.
float fbm(vec3 p) {
  float v = vnoise(p) * 0.62;
  v += vnoise(p * 2.03) * 0.31;
  return v;
}

void main() {
  // ── Everything that does NOT need noise is computed first, so the
  //    expensive fbm only runs on pixels that can actually contribute.
  //    (Fog is nearly all overdraw: this early-out is the whole ball game.)

  // Soft border so a sheet never shows its rectangle
  vec2 c = (vUv - 0.5) * 2.0;
  float radial = 1.0 - smoothstep(uEdge, 1.0, length(c));
  float vertical = smoothstep(0.0, 0.45, vUv.y) * smoothstep(1.0, 0.62, vUv.y);
  float shape = radial * mix(0.55, 1.0, vertical);

  // Do not bury the machine: thin the haze right around the centre
  float centreDist = length(vWorldPos.xz);
  shape *= mix(0.35, 1.0, smoothstep(uHoleRadius, uHoleRadius + 5.0, centreDist));

  // Fade as the camera pushes through a sheet…
  float camDist = distance(vWorldPos, uCamPos);
  shape *= smoothstep(0.6, uNearFade, camDist);

  // …and again as it pulls far back. Billboards stop overlapping at distance
  // and start reading as separate blobs instead of one body of air.
  shape *= 1.0 - smoothstep(uFarFade, uFarFade + 9.0, camDist);

  if (shape * uOpacity < 0.004) discard;

  float t = uTime * uSpeed;
  float n = fbm(vec3(vUv * uScale, uSeed) + vec3(t * 0.55, -t * 0.32, t * 0.11));

  float density = smoothstep(0.16, 0.92, n * shape);
  float alpha = density * uOpacity;
  if (alpha < 0.003) discard;

  gl_FragColor = vec4(uColor * (1.0 + n * uCore), alpha);
}
`

interface SheetProps {
  position: [number, number, number]
  size: [number, number]
  seed: number
  opacity: number
  scale: number
  speed: number
  color: THREE.Color
  billboard?: boolean
  flat?: boolean
  additive?: boolean
  edge?: number
  core?: number
  nearFade?: number
  farFade?: number
  holeRadius?: number
  spin?: number
}

function FogSheet({
  position,
  size,
  seed,
  opacity,
  scale,
  speed,
  color,
  billboard = false,
  flat = false,
  additive = true,
  edge = 0.25,
  core = 0.6,
  nearFade = 4.5,
  farFade = 17,
  holeRadius = 2.4,
  spin = 0,
}: SheetProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: seed * 12.0 },
      uOpacity: { value: opacity },
      uScale: { value: scale },
      uSpeed: { value: speed },
      uSeed: { value: seed },
      uEdge: { value: edge },
      uCore: { value: core },
      uColor: { value: color },
      uCamPos: { value: new THREE.Vector3() },
      uNearFade: { value: nearFade },
      uFarFade: { value: farFade },
      uHoleRadius: { value: holeRadius },
    }),
    [seed, opacity, scale, speed, color, edge, core, nearFade, farFade, holeRadius]
  )

  useFrame((state, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta
      matRef.current.uniforms.uCamPos.value.copy(state.camera.position)
    }
    if (!meshRef.current) return
    if (billboard) {
      // Yaw-only billboard: sheets stay upright but always face the lens.
      const cam = state.camera.position
      meshRef.current.rotation.y = Math.atan2(cam.x - position[0], cam.z - position[2])
    } else if (flat && spin) {
      meshRef.current.rotation.z += delta * spin
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={flat ? [-Math.PI / 2, 0, seed * 2.0] : [0, 0, 0]}
      renderOrder={flat ? 1 : 3}
      frustumCulled={false}
    >
      <planeGeometry args={[size[0], size[1], 1, 1]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={fogVertex}
        fragmentShader={fogFragment}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending}
        toneMapped={false}
      />
    </mesh>
  )
}

interface AtmosphereProps {
  tier: DeviceTier
}

export default function Atmosphere({ tier }: AtmosphereProps) {
  // Phones render without the bloom pass, which is what makes additive haze
  // read on desktop — so the low tier gets denser, tighter-hugging fog to
  // land in the same place visually.
  const profile =
    tier === 'high'
      ? { banks: 7, ground: 3, opacity: 2.3, hole: 3.0, groundHole: 1.4 }
      : tier === 'medium'
        ? { banks: 6, ground: 2, opacity: 2.35, hole: 2.9, groundHole: 1.4 }
        : { banks: 5, ground: 2, opacity: 2.4, hole: 1.8, groundHole: 1.0 }

  const haze = useMemo(() => new THREE.Color('#aab6d8'), [])
  const floor = useMemo(() => new THREE.Color('#6f79ab'), [])

  const banks = useMemo(
    () =>
      Array.from({ length: profile.banks }, (_, i) => {
        const a = (i / profile.banks) * Math.PI * 2 + 0.4
        const r = 6.2 + (i % 3) * 1.6
        return {
          key: `b${i}`,
          position: [Math.sin(a) * r, 1.15 + (i % 4) * 0.5, Math.cos(a) * r] as [number, number, number],
          size: [11 + (i % 3) * 3, 6 + (i % 2) * 2] as [number, number],
          seed: i * 1.37 + 0.5,
          opacity: (0.165 - (i % 3) * 0.03) * profile.opacity,
          scale: 1.5 + (i % 3) * 0.6,
          speed: 0.05 + (i % 4) * 0.014,
        }
      }),
    [profile.banks, profile.opacity]
  )

  const ground = useMemo(
    () =>
      Array.from({ length: profile.ground }, (_, i) => ({
        key: `g${i}`,
        position: [0, 0.08 + i * 0.42, 0] as [number, number, number],
        size: [24 + i * 5, 24 + i * 5] as [number, number],
        seed: 7.3 + i * 2.1,
        opacity: (0.24 - i * 0.045) * profile.opacity,
        scale: 2.2 + i * 0.7,
        speed: 0.035 + i * 0.012,
        spin: (i % 2 === 0 ? 1 : -1) * 0.012,
      })),
    [profile.ground, profile.opacity]
  )

  return (
    <group>
      {/* Standing haze — additive, catches the key light */}
      {banks.map((b) => (
        <FogSheet
          key={b.key}
          position={b.position}
          size={b.size}
          seed={b.seed}
          opacity={b.opacity}
          scale={b.scale}
          speed={b.speed}
          color={haze}
          billboard
          additive
          edge={0.18}
          core={0.5}
          nearFade={5.5}
          holeRadius={profile.hole}
        />
      ))}

      {/* Ground bank — normal blended, gives the deck something to sit in */}
      {ground.map((g) => (
        <FogSheet
          key={g.key}
          position={g.position}
          size={g.size}
          seed={g.seed}
          opacity={g.opacity}
          scale={g.scale}
          speed={g.speed}
          color={floor}
          flat
          additive={false}
          edge={0.05}
          core={0.35}
          nearFade={3.2}
          holeRadius={profile.groundHole}
          spin={g.spin}
        />
      ))}
    </group>
  )
}
