# Architecture Reference — 3D Product Scroll Website

Complete component architecture, camera orbit math, GSAP timeline configuration, Lenis sync, and production patterns.

## Table of Contents
1. Project Structure
2. App Root Component
3. Lenis + GSAP Sync
4. 3D Experience (Canvas Scene)
5. Camera Rig (Scroll-Driven Orbit)
6. Product Model Component
7. Scroll Sections (HTML Overlay)
8. Section Configuration
9. Text Reveal Animations
10. Post-Processing Effects
11. Loading Screen
12. Mobile Responsiveness
13. Performance Optimization

---

## 1. Project Structure

```
src/
├── App.tsx                     # Root: Canvas + Lenis + ScrollSections
├── main.tsx                    # Entry point
├── index.css                   # Tailwind + Lenis CSS
├── components/
│   ├── Layout.tsx              # Lenis provider wrapper
│   ├── ScrollSections.tsx      # HTML content sections (overlay)
│   ├── LoadingScreen.tsx       # 3D asset loading progress
│   └── ui/
│       └── TextReveal.tsx      # GSAP SplitText character animation
├── experience/
│   ├── Experience.tsx          # R3F scene: lights + model + effects
│   ├── CameraRig.tsx          # Scroll-driven spherical camera orbit
│   ├── ProductModel.tsx       # GLB loader via useGLTF
│   ├── Ground.tsx             # Reflective ground plane
│   └── Effects.tsx            # Bloom, SSAO, Vignette
├── config/
│   ├── sections.ts            # Camera stops + content per section
│   └── theme.ts               # Colors, fonts, spacing constants
├── hooks/
│   └── useScrollProgress.ts   # Custom hook: scroll → normalized 0-1
└── public/
    └── models/
        └── product.glb        # Draco-compressed, web-optimized
```

---

## 2. App Root Component

The two-layer architecture: fixed 3D canvas behind scrollable HTML.

```tsx
// App.tsx
import { Suspense, lazy } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { ReactLenis } from 'lenis/react'
import ScrollSections from './components/ScrollSections'
import LoadingScreen from './components/LoadingScreen'

// Lazy-load the 3D scene so the HTML shell renders instantly
const Experience = lazy(() => import('./experience/Experience'))

export default function App() {
  return (
    <>
      {/* Layer 1: Fixed 3D Canvas */}
      <div className="fixed inset-0 z-0">
        <Canvas
          camera={{ position: [0, 1.5, 5], fov: 35 }}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            alpha: false,
          }}
          dpr={[1, 2]}
        >
          <color attach="background" args={['#050510']} />
          <Suspense fallback={null}>
            <Experience />
            <Preload all />
          </Suspense>
        </Canvas>
      </div>

      {/* Layer 2: Scrollable HTML overlay */}
      <ReactLenis
        root
        options={{
          lerp: 0.07,
          duration: 1.2,
          smoothWheel: true,
          syncTouch: false, // Critical for mobile performance
        }}
      >
        <ScrollSections />
      </ReactLenis>

      {/* Loading overlay */}
      <LoadingScreen />
    </>
  )
}
```

---

## 3. Lenis + GSAP Ticker Sync

This is the critical bridge between smooth scrolling and GSAP animations. Without this sync, ScrollTrigger will stutter.

```tsx
// hooks/useGSAPSync.ts
import { useEffect } from 'react'
import { useLenis } from 'lenis/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useGSAPSync() {
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis) return

    // Bridge Lenis scroll events to ScrollTrigger
    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    // Sync GSAP ticker with Lenis RAF
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tickerCallback)
    gsap.ticker.lagSmoothing(0) // Prevents jitter — critical!

    return () => {
      lenis.off('scroll', onScroll)
      gsap.ticker.remove(tickerCallback)
    }
  }, [lenis])
}
```

---

## 4. 3D Experience (Canvas Scene)

```tsx
// experience/Experience.tsx
import { Environment } from '@react-three/drei'
import CameraRig from './CameraRig'
import ProductModel from './ProductModel'
import Ground from './Ground'
import Effects from './Effects'

export default function Experience() {
  return (
    <>
      {/* Studio HDR lighting — THE most important element for photorealism */}
      <Environment preset="studio" environmentIntensity={1.0} />

      {/* Subtle fill lights */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 8, 3]} intensity={0.4} castShadow />
      <spotLight
        position={[-3, 5, -3]}
        angle={0.4}
        penumbra={0.8}
        intensity={0.6}
        color="#ffd4a0"
      />

      {/* Scroll-driven camera */}
      <CameraRig />

      {/* The product */}
      <ProductModel />

      {/* Reflective ground */}
      <Ground />

      {/* Post-processing */}
      <Effects />
    </>
  )
}
```

---

## 5. Camera Rig — Scroll-Driven Orbit

This is the core mechanism. GSAP animates proxy values, useFrame reads them every frame to position the camera on a sphere.

```tsx
// experience/CameraRig.tsx
import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sections } from '../config/sections'

gsap.registerPlugin(ScrollTrigger)

export default function CameraRig() {
  const { camera } = useThree()

  // Animated proxy object — GSAP writes to this, useFrame reads from it
  const anim = useRef({
    theta: sections[0].angle,          // horizontal orbit angle
    phi: sections[0].phi,              // vertical angle
    radius: sections[0].radius || 5,   // distance from center
    targetY: sections[0].targetY || 0, // lookAt Y offset
  })

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.scroll-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,  // Smooth 1.5s catch-up for premium feel
        snap: {
          snapTo: sections.map((_, i) => i / (sections.length - 1)),
          duration: { min: 0.3, max: 0.8 },
          delay: 0.1,
          ease: 'power2.inOut',
        },
      },
    })

    // Build keyframes from section config
    sections.forEach((section, i) => {
      if (i === 0) return // Skip first — it's the starting position
      const progress = i / (sections.length - 1)
      tl.to(anim.current, {
        theta: section.angle,
        phi: section.phi,
        radius: section.radius || 5,
        targetY: section.targetY || 0,
        duration: 1 / (sections.length - 1),
        ease: 'none', // Linear between stops; snap handles the easing
      }, progress - 1 / (sections.length - 1))
    })
  }, [])

  // Every frame: convert spherical → cartesian, move camera
  useFrame(() => {
    const { theta, phi, radius, targetY } = anim.current

    camera.position.x = radius * Math.sin(phi) * Math.sin(theta)
    camera.position.y = radius * Math.cos(phi)
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta)

    camera.lookAt(0, targetY, 0)
  })

  return null
}
```

### Camera math explained

Spherical coordinates `(radius, theta, phi)` → Cartesian `(x, y, z)`:
- `theta` = rotation around the Y axis (horizontal orbit). 0 → 2π = full circle
- `phi` = angle from the top. π/2 = eye level, π/3 = looking slightly down, π/2.5 = slightly above
- `radius` = distance from the center of the product

The conversion formula:
```
x = r × sin(φ) × sin(θ)
y = r × cos(φ)
z = r × sin(φ) × cos(θ)
```

---

## 6. Product Model Component

```tsx
// experience/ProductModel.tsx
import { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// If you used gltfjsx to generate a typed component, import that instead.
// This is the generic loader pattern:

export default function ProductModel() {
  const { scene } = useGLTF('/models/product.glb')
  const ref = useRef<THREE.Group>(null)

  // Optional: subtle idle float animation
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.03
    }
  })

  return (
    <group ref={ref} position={[0, 0, 0]} scale={1}>
      <primitive object={scene} />
    </group>
  )
}

// Preload the model
useGLTF.preload('/models/product.glb')
```

---

## 7. Scroll Sections (HTML Overlay)

```tsx
// components/ScrollSections.tsx
import { useRef, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sections } from '../config/sections'

gsap.registerPlugin(ScrollTrigger)

export default function ScrollSections() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current) return

    const sectionEls = containerRef.current.querySelectorAll('.content-section')

    sectionEls.forEach((el, i) => {
      const inner = el.querySelector('.section-inner')
      if (!inner) return

      const sectionSize = 100 / sections.length

      gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: `${i * sectionSize}% top`,
          end: `${(i + 1) * sectionSize}% top`,
          scrub: 0.8,
        },
      })
        .fromTo(inner,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
        )
        .to(inner, { opacity: 1, duration: 0.5 }) // Hold visible
        .to(inner, { opacity: 0, y: -30, duration: 0.25, ease: 'power2.in' })
    })
  }, [])

  return (
    <div ref={containerRef} className="scroll-container relative z-10">
      {sections.map((section, i) => (
        <section
          key={i}
          className="content-section h-screen flex items-center pointer-events-none"
        >
          <div className={`section-inner max-w-xl px-8 ${
            i % 2 === 0 ? 'ml-[8vw]' : 'ml-auto mr-[8vw]'
          }`}>
            {section.label && (
              <span className="text-xs uppercase tracking-[0.3em] text-amber-400/80 font-medium mb-4 block">
                {section.label}
              </span>
            )}
            <h2 className="text-4xl md:text-6xl font-light text-white mb-6 leading-tight">
              {section.title}
            </h2>
            <p className="text-lg text-white/60 leading-relaxed">
              {section.copy}
            </p>
            {section.cta && (
              <a
                href={section.cta.href}
                className="pointer-events-auto inline-block mt-8 px-8 py-3 border border-white/20 text-white text-sm tracking-wider uppercase hover:bg-white/10 transition-colors"
              >
                {section.cta.text}
              </a>
            )}
          </div>
        </section>
      ))}
    </div>
  )
}
```

---

## 8. Section Configuration

```typescript
// config/sections.ts
export interface Section {
  angle: number       // theta — horizontal orbit angle in radians
  phi: number         // vertical angle (π/2 = eye level)
  radius?: number     // camera distance (default 5)
  targetY?: number    // lookAt Y offset
  label?: string      // small eyebrow text
  title: string       // main heading
  copy: string        // paragraph text
  cta?: { text: string; href: string }
}

export const sections: Section[] = [
  {
    angle: 0,
    phi: Math.PI / 2.3,
    radius: 5.5,
    targetY: 0.2,
    label: 'Introducing',
    title: 'JARVIS',
    copy: 'The AI-powered trading terminal that sees what others miss. Real-time signal processing, risk analysis, and market clarity — in one device.',
  },
  {
    angle: Math.PI / 2,
    phi: Math.PI / 2.5,
    radius: 4.5,
    targetY: 0,
    label: 'Signal Processing',
    title: 'Read the market\nin real time',
    copy: 'Fifteen proprietary strategies analyze every token across the Solana ecosystem. Pattern recognition at the speed of light.',
  },
  {
    angle: Math.PI,
    phi: Math.PI / 3,
    radius: 5,
    targetY: 0.3,
    label: 'Risk Management',
    title: 'Precision\nrisk control',
    copy: 'Multi-layered safety analysis with RugCheck, GoPlus, and Birdeye integration. Every trade is filtered through comprehensive risk assessment.',
  },
  {
    angle: (3 * Math.PI) / 2,
    phi: Math.PI / 2.2,
    radius: 4.8,
    targetY: 0.1,
    label: 'Intelligence',
    title: 'Clarity through\ncomplexity',
    copy: 'While others react, JARVIS anticipates. Machine learning models trained on millions of on-chain events to surface alpha before it appears.',
  },
  {
    angle: Math.PI * 2,
    phi: Math.PI / 2.3,
    radius: 5.5,
    targetY: 0.2,
    label: 'kr8tiv AI',
    title: 'The future\nis autonomous',
    copy: 'Built by kr8tiv AI. Designed for the next generation of autonomous trading.',
    cta: { text: 'Join the waitlist', href: '#waitlist' },
  },
]
```

---

## 9. Text Reveal Animations

For premium text reveals, use GSAP SplitText (now free) to animate individual characters:

```tsx
// components/ui/TextReveal.tsx
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(SplitText, ScrollTrigger)

interface TextRevealProps {
  children: string
  className?: string
  trigger?: string // ScrollTrigger trigger selector
}

export default function TextReveal({ children, className = '', trigger }: TextRevealProps) {
  const textRef = useRef<HTMLHeadingElement>(null)

  useGSAP(() => {
    if (!textRef.current) return

    const split = new SplitText(textRef.current, { type: 'chars' })

    gsap.fromTo(split.chars,
      { opacity: 0, y: 20, rotateX: -40 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        stagger: 0.02,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: trigger ? {
          trigger,
          start: 'top 80%',
          end: 'top 30%',
          toggleActions: 'play none none reverse',
        } : undefined,
      }
    )
  }, [])

  return <h2 ref={textRef} className={className}>{children}</h2>
}
```

---

## 10. Post-Processing Effects

```tsx
// experience/Effects.tsx
import { EffectComposer, Bloom, Vignette, N8AO } from '@react-three/postprocessing'

export default function Effects() {
  return (
    <EffectComposer multisampling={4}>
      {/* Bloom — makes emissive/bright surfaces glow */}
      <Bloom
        luminanceThreshold={1.1}
        luminanceSmoothing={0.4}
        intensity={0.5}
        mipmapBlur
      />

      {/* Ambient Occlusion — adds depth in crevices */}
      <N8AO
        aoRadius={0.8}
        intensity={1.5}
        distanceFalloff={0.5}
      />

      {/* Vignette — darkens edges for cinematic feel */}
      <Vignette darkness={0.35} offset={0.3} />
    </EffectComposer>
  )
}
```

---

## 11. Loading Screen

```tsx
// components/LoadingScreen.tsx
import { useState, useEffect } from 'react'
import { useProgress } from '@react-three/drei'

export default function LoadingScreen() {
  const { progress, active } = useProgress()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!active && progress === 100) {
      const timer = setTimeout(() => setVisible(false), 800)
      return () => clearTimeout(timer)
    }
  }, [active, progress])

  if (!visible) return null

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#050510] transition-opacity duration-700 ${
      !active && progress === 100 ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="text-center">
        <div className="text-white/40 text-sm tracking-[0.3em] uppercase mb-8">
          Loading Experience
        </div>
        <div className="w-48 h-px bg-white/10 relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-amber-400/80 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-white/20 text-xs mt-4">{Math.round(progress)}%</div>
      </div>
    </div>
  )
}
```

---

## 12. Mobile Responsiveness

Mobile is the hardest challenge for 3D websites. Key strategies:

```tsx
// hooks/useDeviceCapability.ts
import { useState, useEffect } from 'react'

export function useDeviceCapability() {
  const [tier, setTier] = useState<'high' | 'medium' | 'low'>('high')

  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const gl = document.createElement('canvas').getContext('webgl2')
    const renderer = gl?.getParameter(gl.RENDERER) || ''

    if (isMobile || renderer.includes('Mali') || renderer.includes('Adreno 5')) {
      setTier('low')
    } else if (window.innerWidth < 1200) {
      setTier('medium')
    }
  }, [])

  return tier
}
```

Use it to adjust rendering:

```tsx
// In Experience.tsx
const tier = useDeviceCapability()

<Canvas
  dpr={tier === 'low' ? [1, 1] : [1, 2]}
  camera={{ fov: tier === 'low' ? 50 : 35 }}
>
  {tier !== 'low' && <Effects />}
  {/* ... */}
</Canvas>
```

Mobile CSS considerations:
- Use `dvh` (dynamic viewport height) instead of `vh` to handle mobile browser chrome
- Reduce text sizes on mobile: `text-3xl md:text-6xl`
- Shift section alignment: full-width on mobile, side-aligned on desktop
- Consider reducing sections from 5 to 3 on mobile for faster scroll

---

## 13. Performance Optimization

Target metrics:
- **< 200 draw calls** on mobile
- **< 5MB total 3D assets** (compressed)
- **60fps** on mid-range devices
- **LCP < 2.5s** by lazy-loading Canvas

Key techniques:
- `React.lazy(() => import('./Experience'))` for the Canvas — HTML shell loads instantly
- `useGLTF` auto-caches; add `useGLTF.preload('/models/product.glb')` at module level
- Use `frameloop="demand"` on Canvas if you want to manually control renders
- Draco compression on GLB: `gltf-transform optimize input.glb output.glb --compress draco`
- KTX2 textures for GPU-compressed formats (75% less VRAM)
- `<PerformanceMonitor>` from drei to auto-adjust DPR based on framerate
- Dispose unused textures/geometries when navigating away

### CSS for the base layout

```css
/* index.css */
@import 'lenis/dist/lenis.css';
@import 'tailwindcss';

html, body {
  margin: 0;
  padding: 0;
  background: #050510;
  color: white;
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Use 100dvh on mobile for proper viewport sizing */
.h-screen {
  height: 100dvh;
}
```
