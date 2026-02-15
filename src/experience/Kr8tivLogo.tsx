import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────
   Kr8tiv Logo — Holographic Projection Above Device

   The logo appears as a hyper-clean holographic projection —
   like light being projected through smoke. Features:

   - Logo texture used as shape mask (alpha channel)
   - Bright white core with soft bloom-ready glow
   - Subtle scan-line interference pattern
   - Gentle flicker (not cheesy — just enough to feel alive)
   - Edge-glow halo effect
   - Additive blending so it naturally interacts with the
     smoke trails flowing past it

   Uses THREE.ShaderMaterial directly for maximum compatibility.
   ──────────────────────────────────────────────────────────── */

const logoVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const logoFragmentShader = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform sampler2D uLogoTexture;
uniform float uIntensity;

void main() {
  // ── Sample logo alpha ──
  vec4 logoSample = texture2D(uLogoTexture, vUv);
  float logoAlpha = logoSample.a;

  // Early discard for fully transparent areas
  if (logoAlpha < 0.02) discard;

  // ── Core brightness — clean white ──
  float core = logoAlpha;

  // ── Subtle scan-line interference ──
  float scanFreq = 300.0;
  float scanSpeed = 8.0;
  float scan = sin(vUv.y * scanFreq + uTime * scanSpeed) * 0.5 + 0.5;
  scan = smoothstep(0.3, 0.7, scan);
  float scanEffect = 0.92 + scan * 0.08;

  // ── Slow horizontal sweep ──
  float sweep = sin(vUv.x * 3.14159 + uTime * 0.5) * 0.5 + 0.5;
  sweep = pow(sweep, 3.0);
  float sweepBrightness = 1.0 + sweep * 0.15;

  // ── Gentle flicker ──
  float flicker = 1.0;
  flicker *= 0.97 + sin(uTime * 1.2) * 0.03;
  flicker *= 0.98 + sin(uTime * 3.7) * 0.02;
  float glitch = step(0.995, sin(uTime * 50.0 + vUv.x * 100.0) * 0.5 + 0.5);
  flicker *= 1.0 - glitch * 0.15;

  // ── Edge glow halo ──
  float offset = 0.008;
  float edgeL = texture2D(uLogoTexture, vUv + vec2(-offset, 0.0)).a;
  float edgeR = texture2D(uLogoTexture, vUv + vec2(offset, 0.0)).a;
  float edgeT = texture2D(uLogoTexture, vUv + vec2(0.0, offset)).a;
  float edgeB = texture2D(uLogoTexture, vUv + vec2(0.0, -offset)).a;
  float edgeDetect = abs(logoAlpha - edgeL) + abs(logoAlpha - edgeR) +
                     abs(logoAlpha - edgeT) + abs(logoAlpha - edgeB);
  edgeDetect = smoothstep(0.0, 0.5, edgeDetect);
  float edgeGlow = edgeDetect * 0.4;

  // ── Outer halo ──
  float haloOffset = 0.025;
  float haloAlpha = 0.0;
  for (float a = 0.0; a < 6.28; a += 0.785) {
    vec2 haloUV = vUv + vec2(cos(a), sin(a)) * haloOffset;
    haloAlpha += texture2D(uLogoTexture, haloUV).a;
  }
  haloAlpha /= 8.0;
  float halo = haloAlpha * 0.15;

  // ── Compose ──
  float intensity = (core * scanEffect * sweepBrightness + edgeGlow + halo) * flicker * uIntensity;

  vec3 color = vec3(1.0);
  color = mix(color, vec3(0.9, 0.92, 1.0), edgeDetect * 0.3);

  gl_FragColor = vec4(color * intensity, intensity);
}
`

// ── Positioning ─────────────────────────────────────────────

const LOGO_Y = 1.2
const FLOAT_AMPLITUDE = 0.04
const FLOAT_SPEED = 0.4

// Logo is 800×300 → ~2.67:1 aspect ratio
const LOGO_WIDTH = 2.8
const LOGO_HEIGHT = LOGO_WIDTH / 2.67

// ── Component ───────────────────────────────────────────────

export default function Kr8tivLogo() {
  const groupRef = useRef<THREE.Group>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)

  // Load logo texture
  const logoTexture = useTexture('/images/kr8tiv-logo.png')

  useMemo(() => {
    logoTexture.minFilter = THREE.LinearFilter
    logoTexture.magFilter = THREE.LinearFilter
    logoTexture.generateMipmaps = false
  }, [logoTexture])

  // Create shader material with uniforms
  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uLogoTexture: { value: logoTexture },
      uIntensity: { value: 2.2 },
    },
    vertexShader: logoVertexShader,
    fragmentShader: logoFragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  }), [logoTexture])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // Gentle floating
    if (groupRef.current) {
      groupRef.current.position.y = LOGO_Y + Math.sin(t * FLOAT_SPEED) * FLOAT_AMPLITUDE
      groupRef.current.rotation.y = Math.sin(t * 0.15) * 0.015
    }

    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t
    }
  })

  return (
    <group ref={groupRef} position={[0, LOGO_Y, 0]}>
      {/* Main logo — holographic projection */}
      <mesh>
        <planeGeometry args={[LOGO_WIDTH, LOGO_HEIGHT]} />
        <shaderMaterial ref={matRef} args={[shaderArgs]} />
      </mesh>

      {/* Subtle ground-projected light cone */}
      <pointLight
        position={[0, -0.5, 0.2]}
        color="#ffffff"
        intensity={0.15}
        distance={3}
        decay={2}
      />
    </group>
  )
}
