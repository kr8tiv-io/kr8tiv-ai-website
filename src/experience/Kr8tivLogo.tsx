import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from '../lib/asset'

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

const LOGO_Y = 2.05
const FLOAT_AMPLITUDE = 0.05
const FLOAT_SPEED = 0.4

// Logo is 800×300 → ~2.67:1 aspect ratio
const LOGO_WIDTH = 3.3
const LOGO_HEIGHT = LOGO_WIDTH / 2.67

// The machine bed: 4.2 × 0.5 × 2.2, top face at y = 0.25.
const DECK_TOP = 0.2555
const DECAL_WIDTH = 1.55
const DECAL_HEIGHT = DECAL_WIDTH / 2.67
const DECAL_Z = 0.78

// ── Component ───────────────────────────────────────────────

interface Kr8tivLogoProps {
  /** Phones get a smaller mark so it never crowds the HTML hero copy. */
  compact?: boolean
}

export default function Kr8tivLogo({ compact = false }: Kr8tivLogoProps) {
  const groupRef = useRef<THREE.Group>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const yawRef = useRef(0)

  // Load logo texture
  const logoTexture = useTexture(asset('/images/kr8tiv-logo.png'))

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
      // Quieter on phones: portrait copy sits over the scene, so the mark
      // reads as a background projection instead of competing headline.
      uIntensity: { value: compact ? 0.95 : 1.75 },
    },
    vertexShader: logoVertexShader,
    fragmentShader: logoFragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  }), [logoTexture, compact])

  // The same mark, etched into the machine's deck plate — dimmer, no flicker
  // sweep needed, it just sits there like screen-printed livery.
  const decalArgs = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uLogoTexture: { value: logoTexture },
      uIntensity: { value: 0.85 },
    },
    vertexShader: logoVertexShader,
    fragmentShader: logoFragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  }), [logoTexture])
  const decalMatRef = useRef<THREE.ShaderMaterial>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // Gentle floating + soft billboard: the hologram slowly turns to face the
    // camera so the wordmark never reads mirrored from the back orbit angles.
    if (groupRef.current) {
      groupRef.current.position.y =
        (compact ? 1.0 : LOGO_Y) + Math.sin(t * FLOAT_SPEED) * FLOAT_AMPLITUDE

      const cam = state.camera.position
      const targetYaw = Math.atan2(cam.x, cam.z)
      let dYaw = targetYaw - yawRef.current
      while (dYaw > Math.PI) dYaw -= Math.PI * 2
      while (dYaw < -Math.PI) dYaw += Math.PI * 2
      yawRef.current += dYaw * 0.06
      groupRef.current.rotation.y = yawRef.current + Math.sin(t * 0.15) * 0.015
    }

    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t
    }
    if (decalMatRef.current) {
      decalMatRef.current.uniforms.uTime.value = t
    }
  })

  const width = compact ? LOGO_WIDTH * 0.62 : LOGO_WIDTH
  const height = compact ? LOGO_HEIGHT * 0.62 : LOGO_HEIGHT
  // On phones the hologram sits low, just off the deck: the HTML hero copy owns
  // the upper half of a portrait screen, and a mark floating up there fights it.
  const hoverY = compact ? 1.0 : LOGO_Y

  return (
    <>
      <group ref={groupRef} position={[0, hoverY, 0]}>
        {/* Main logo — holographic projection above the machine */}
        <mesh>
          <planeGeometry args={[width, height]} />
          <shaderMaterial ref={matRef} args={[shaderArgs]} />
        </mesh>

        {/* Projection light spilling back down onto the deck */}
        <pointLight
          position={[0, -0.5, 0.2]}
          color="#ffffff"
          intensity={0.22}
          distance={3.4}
          decay={2}
        />
      </group>

      {/* Emitter cone — ties the hologram to the machine it is projected from */}
      <mesh position={[0, (hoverY + DECK_TOP) / 2, 0]} renderOrder={2}>
        <cylinderGeometry args={[width * 0.34, 0.16, hoverY - DECK_TOP, 16, 1, true]} />
        <meshBasicMaterial
          color="#cfd8ff"
          transparent
          opacity={0.045}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Livery — the mark sitting ON the deck plate itself.
          The Z flip makes it read the right way up from the front of the machine. */}
      <mesh position={[0, DECK_TOP, DECAL_Z]} rotation={[-Math.PI / 2, 0, Math.PI]} renderOrder={2}>
        <planeGeometry args={[DECAL_WIDTH, DECAL_HEIGHT]} />
        <shaderMaterial ref={decalMatRef} args={[decalArgs]} />
      </mesh>
    </>
  )
}
