import { useRef, useMemo } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────
   Ground v4 — Dark Mirror Surface with Wave Ripples

   Everything from v3 plus:
   - Subdivided plane (128×128) for vertex displacement
   - Concentric wave ripples emanating from mouse position
   - Waves decay with distance and fade over time
   - Grid lines distort along with the surface
   ──────────────────────────────────────────────────────────── */

const groundVertexShader = /* glsl */ `
uniform float uTime;
uniform vec3 uMouseWorld;
uniform float uMouseIntensity;

varying vec2 vUv;
varying vec3 vWorldPos;

#define PI 3.14159265359

void main() {
  vUv = uv;
  vec3 pos = position;

  // Transform to world space for mouse distance calculation
  vec4 wp = modelMatrix * vec4(pos, 1.0);

  // ── Concentric wave ripples from mouse ──
  float mouseDist = length(wp.xz - uMouseWorld.xz);

  // Multiple wave rings expanding outward
  float waveFreq = 3.5;
  float waveSpeed = 4.0;
  float wave = sin(mouseDist * waveFreq - uTime * waveSpeed) * 0.5 + 0.5;
  wave *= wave; // Sharpen the peaks

  // Amplitude falls off with distance from mouse
  float waveAmplitude = exp(-mouseDist * 0.25) * uMouseIntensity * 0.12;

  // Second harmonic for richer ripple pattern
  float wave2 = sin(mouseDist * 6.0 - uTime * waveSpeed * 1.3) * 0.5 + 0.5;
  float waveAmplitude2 = exp(-mouseDist * 0.4) * uMouseIntensity * 0.04;

  // Apply vertical displacement (Z is up since plane is rotated)
  pos.z += wave * waveAmplitude + wave2 * waveAmplitude2;

  // Subtle ambient waves (ocean-like gentle undulation)
  float ambient = sin(pos.x * 0.3 + uTime * 0.4) * cos(pos.y * 0.2 + uTime * 0.3) * 0.015;
  pos.z += ambient;

  vec4 finalWp = modelMatrix * vec4(pos, 1.0);
  vWorldPos = finalWp.xyz;
  gl_Position = projectionMatrix * viewMatrix * finalWp;
}
`

const groundFragmentShader = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying vec3 vWorldPos;

uniform float uTime;
uniform vec3 uMouseWorld;
uniform float uMouseIntensity;

#define GRID_SCALE 16.0
#define LINE_WIDTH 0.018

float gridLine(vec2 uv, float scale, float width) {
  vec2 grid = abs(fract(uv * scale - 0.5) - 0.5);
  float line = min(grid.x, grid.y);
  return 1.0 - smoothstep(0.0, width, line);
}

void main() {
  vec2 worldXZ = vWorldPos.xz;

  // ── Grid ──
  float mainGrid = gridLine(worldXZ, GRID_SCALE, LINE_WIDTH);

  // ── Mouse proximity makes grid visible ──
  float mouseDist = length(worldXZ - uMouseWorld.xz);
  float mouseGlow = exp(-mouseDist * 0.18) * uMouseIntensity;

  // Grid is nearly invisible at rest, lights up on mouse proximity
  float gridBrightness = mainGrid * (0.004 + mouseGlow * 0.4);

  // ── Wave crest glow — grid lines brighten on wave peaks ──
  float waveHighlight = sin(mouseDist * 3.5 - uTime * 4.0) * 0.5 + 0.5;
  waveHighlight *= waveHighlight;
  float waveGlow = waveHighlight * exp(-mouseDist * 0.25) * uMouseIntensity * 0.075;
  gridBrightness += mainGrid * waveGlow;

  // ── Soft mouse radiance on the ground ──
  float mouseHalo = exp(-mouseDist * 0.15) * uMouseIntensity * 0.05;

  // ── Ripple ring glow — visible even between grid lines ──
  float ringGlow = waveHighlight * exp(-mouseDist * 0.3) * uMouseIntensity * 0.02;

  // ── Radial fade ──
  float centerDist = length(worldXZ) / 40.0;
  float radialFade = 1.0 - smoothstep(0.1, 0.85, centerDist);
  radialFade = pow(radialFade, 1.8);

  // ── Compose — very dark base, white grid ──
  vec3 baseColor = vec3(0.01, 0.01, 0.015);
  vec3 gridColor = vec3(1.0);

  vec3 color = baseColor;
  color += gridColor * gridBrightness;
  color += gridColor * mouseHalo;
  color += gridColor * ringGlow;

  // Subtle specular-like sheen (fake reflection)
  float sheen = exp(-length(worldXZ) * 0.06) * 0.007;
  color += vec3(sheen);

  color *= radialFade;

  gl_FragColor = vec4(color, 1.0);
}
`

const DarkMirrorGroundMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uMouseWorld: new THREE.Vector3(0, 0, 0),
    uMouseIntensity: 0,
  },
  groundVertexShader,
  groundFragmentShader
)

extend({ DarkMirrorGroundMaterial: DarkMirrorGroundMaterialImpl })

export default function Ground() {
  const matRef = useRef<any>(null)
  const mouseWorld = useRef(new THREE.Vector3())
  const mouseTarget = useRef(new THREE.Vector3())

  // Subdivided plane for vertex displacement waves
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(80, 80, 128, 128)
  }, [])

  useFrame((state) => {
    if (!matRef.current) return
    matRef.current.uTime = state.clock.elapsedTime

    const { pointer, viewport } = state
    mouseTarget.current.set(
      (pointer.x * viewport.width) / 2,
      0,
      -(pointer.y * viewport.height) / 2
    )
    mouseWorld.current.lerp(mouseTarget.current, 0.06)
    matRef.current.uMouseWorld = mouseWorld.current

    const mouseActivity = Math.min(
      Math.abs(pointer.x) + Math.abs(pointer.y),
      1.5
    )
    matRef.current.uMouseIntensity = THREE.MathUtils.lerp(
      matRef.current.uMouseIntensity,
      0.5 + mouseActivity * 0.8,
      0.06
    )
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} geometry={geometry}>
      <darkMirrorGroundMaterial ref={matRef} depthWrite />
    </mesh>
  )
}
