#!/usr/bin/env python3
"""
Scaffold a new 3D product website project.
Usage: python3 scaffold.py <project-name> [--brand "Brand Name"] [--product "Product Name"]
"""

import os
import sys
import json
import argparse
import subprocess


def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f"  ✅ {os.path.relpath(path)}")


def scaffold(project_name, brand="Brand", product="Product"):
    base = os.path.join(os.getcwd(), project_name)

    if os.path.exists(base):
        print(f"❌ Directory '{project_name}' already exists")
        sys.exit(1)

    print(f"\n🚀 Scaffolding 3D product website: {project_name}")
    print(f"   Brand: {brand}")
    print(f"   Product: {product}\n")

    # package.json
    create_file(f"{base}/package.json", json.dumps({
        "name": project_name,
        "private": True,
        "version": "0.0.1",
        "type": "module",
        "scripts": {
            "dev": "vite",
            "build": "tsc -b && vite build",
            "preview": "vite preview",
            "deploy": "npm run build && npx wrangler pages deploy dist"
        },
        "dependencies": {
            "@react-three/drei": "^9.120.0",
            "@react-three/fiber": "^9.0.0",
            "@react-three/postprocessing": "^2.16.0",
            "three": "^0.171.0",
            "gsap": "^3.12.0",
            "@gsap/react": "^2.1.0",
            "lenis": "^1.3.0",
            "react": "^19.0.0",
            "react-dom": "^19.0.0"
        },
        "devDependencies": {
            "@tailwindcss/vite": "^4.0.0",
            "@types/react": "^19.0.0",
            "@types/react-dom": "^19.0.0",
            "@types/three": "^0.171.0",
            "tailwindcss": "^4.0.0",
            "typescript": "^5.7.0",
            "vite": "^6.0.0",
            "@vitejs/plugin-react": "^4.3.0"
        }
    }, indent=2))

    # vite.config.ts
    create_file(f"{base}/vite.config.ts", """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
          gsap: ['gsap', '@gsap/react'],
        },
      },
    },
  },
})
""")

    # tsconfig
    create_file(f"{base}/tsconfig.json", json.dumps({
        "compilerOptions": {
            "target": "ES2020",
            "useDefineForClassFields": True,
            "lib": ["ES2020", "DOM", "DOM.Iterable"],
            "module": "ESNext",
            "skipLibCheck": True,
            "moduleResolution": "bundler",
            "allowImportingTsExtensions": True,
            "isolatedModules": True,
            "moduleDetection": "force",
            "noEmit": True,
            "jsx": "react-jsx",
            "strict": True,
            "noUnusedLocals": True,
            "noUnusedParameters": True,
            "noFallthroughCasesInSwitch": True,
            "noUncheckedSideEffectImports": True
        },
        "include": ["src"]
    }, indent=2))

    # index.html
    create_file(f"{base}/index.html", f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{product} — {brand}</title>
    <meta name="description" content="{product} by {brand}. An immersive product experience." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
    <style>
      body {{ margin: 0; background: #050510; }}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
""")

    # main.tsx
    create_file(f"{base}/src/main.tsx", """import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
""")

    # index.css
    create_file(f"{base}/src/index.css", """@import 'lenis/dist/lenis.css';
@import 'tailwindcss';

:root {
  --color-bg: #050510;
  --color-accent: #d4a853;
  --color-accent-muted: rgba(212, 168, 83, 0.6);
  --font-display: 'Syne', sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
}

html, body, #root {
  margin: 0;
  padding: 0;
  background: var(--color-bg);
  color: white;
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.h-screen {
  height: 100dvh;
}

/* Selection */
::selection {
  background: var(--color-accent);
  color: var(--color-bg);
}
""")

    # App.tsx
    create_file(f"{base}/src/App.tsx", """import { Suspense, lazy } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { ReactLenis } from 'lenis/react'
import ScrollSections from './components/ScrollSections'
import LoadingScreen from './components/LoadingScreen'

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
          syncTouch: false,
        }}
      >
        <ScrollSections />
      </ReactLenis>

      {/* Loading overlay */}
      <LoadingScreen />
    </>
  )
}
""")

    # sections config
    create_file(f"{base}/src/config/sections.ts", f"""export interface Section {{
  angle: number
  phi: number
  radius?: number
  targetY?: number
  label?: string
  title: string
  copy: string
  cta?: {{ text: string; href: string }}
}}

export const sections: Section[] = [
  {{
    angle: 0,
    phi: Math.PI / 2.3,
    radius: 5.5,
    targetY: 0.2,
    label: 'Introducing',
    title: '{product}',
    copy: 'Placeholder description. Replace with your product copy.',
  }},
  {{
    angle: Math.PI / 2,
    phi: Math.PI / 2.5,
    radius: 4.5,
    targetY: 0,
    label: 'Feature One',
    title: 'Headline for\\nfeature one',
    copy: 'Describe the first key feature or capability of your product.',
  }},
  {{
    angle: Math.PI,
    phi: Math.PI / 3,
    radius: 5,
    targetY: 0.3,
    label: 'Feature Two',
    title: 'Headline for\\nfeature two',
    copy: 'Describe the second key feature. Focus on what makes it unique.',
  }},
  {{
    angle: (3 * Math.PI) / 2,
    phi: Math.PI / 2.2,
    radius: 4.8,
    targetY: 0.1,
    label: 'Feature Three',
    title: 'Headline for\\nfeature three',
    copy: 'Describe the intelligence, technology, or craftsmanship behind the product.',
  }},
  {{
    angle: Math.PI * 2,
    phi: Math.PI / 2.3,
    radius: 5.5,
    targetY: 0.2,
    label: '{brand}',
    title: 'The future\\nstarts here',
    copy: 'Closing statement. Tie the product back to the brand vision.',
    cta: {{ text: 'Learn more', href: '#' }},
  }},
]
""")

    # Experience
    create_file(f"{base}/src/experience/Experience.tsx", """import { Environment } from '@react-three/drei'
import CameraRig from './CameraRig'
import ProductModel from './ProductModel'
import Ground from './Ground'
import Effects from './Effects'

export default function Experience() {
  return (
    <>
      <Environment preset="studio" environmentIntensity={1.0} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 8, 3]} intensity={0.4} castShadow />
      <spotLight
        position={[-3, 5, -3]}
        angle={0.4}
        penumbra={0.8}
        intensity={0.6}
        color="#ffd4a0"
      />
      <CameraRig />
      <ProductModel />
      <Ground />
      <Effects />
    </>
  )
}
""")

    # CameraRig
    create_file(f"{base}/src/experience/CameraRig.tsx", """import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sections } from '../config/sections'

gsap.registerPlugin(ScrollTrigger)

export default function CameraRig() {
  const { camera } = useThree()

  const anim = useRef({
    theta: sections[0].angle,
    phi: sections[0].phi,
    radius: sections[0].radius || 5,
    targetY: sections[0].targetY || 0,
  })

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.scroll-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
        snap: {
          snapTo: sections.map((_, i) => i / (sections.length - 1)),
          duration: { min: 0.3, max: 0.8 },
          delay: 0.1,
          ease: 'power2.inOut',
        },
      },
    })

    sections.forEach((section, i) => {
      if (i === 0) return
      tl.to(anim.current, {
        theta: section.angle,
        phi: section.phi,
        radius: section.radius || 5,
        targetY: section.targetY || 0,
        duration: 1 / (sections.length - 1),
        ease: 'none',
      }, (i - 1) / (sections.length - 1))
    })
  }, [])

  useFrame(() => {
    const { theta, phi, radius, targetY } = anim.current
    camera.position.x = radius * Math.sin(phi) * Math.sin(theta)
    camera.position.y = radius * Math.cos(phi)
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta)
    camera.lookAt(0, targetY, 0)
  })

  return null
}
""")

    # ProductModel (placeholder box until real GLB is added)
    create_file(f"{base}/src/experience/ProductModel.tsx", """import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
// import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * PLACEHOLDER: Replace this with your actual GLB model.
 *
 * To use a real model:
 * 1. Place your optimized GLB at public/models/product.glb
 * 2. Uncomment the useGLTF import above
 * 3. Replace the mesh below with:
 *
 *    const { scene } = useGLTF('/models/product.glb')
 *    return (
 *      <group ref={ref} position={[0, 0, 0]}>
 *        <primitive object={scene} />
 *      </group>
 *    )
 *
 * 4. Add preload: useGLTF.preload('/models/product.glb')
 */

export default function ProductModel() {
  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.03
    }
  })

  return (
    <group ref={ref} position={[0, 0.5, 0]}>
      {/* Placeholder: wide boxy device shape */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.6, 1.6]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.9}
          roughness={0.15}
          envMapIntensity={1.2}
        />
      </mesh>
      {/* Top glass surface */}
      <mesh position={[0, 0.31, 0]}>
        <boxGeometry args={[2.3, 0.02, 1.5]} />
        <meshStandardMaterial
          color="#0a0a1a"
          metalness={0.5}
          roughness={0.05}
          transparent
          opacity={0.7}
        />
      </mesh>
      {/* Glowing edge light */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[2.42, 0.01, 1.62]} />
        <meshStandardMaterial
          color="#d4a853"
          emissive="#d4a853"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
""")

    # Ground
    create_file(f"{base}/src/experience/Ground.tsx", """import { MeshReflectorMaterial } from '@react-three/drei'

export default function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[50, 50]} />
      <MeshReflectorMaterial
        mirror={0.4}
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={30}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#050510"
        metalness={0.5}
      />
    </mesh>
  )
}
""")

    # Effects
    create_file(f"{base}/src/experience/Effects.tsx", """import { EffectComposer, Bloom, Vignette, N8AO } from '@react-three/postprocessing'

export default function Effects() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom
        luminanceThreshold={1.1}
        luminanceSmoothing={0.4}
        intensity={0.5}
        mipmapBlur
      />
      <N8AO aoRadius={0.8} intensity={1.5} distanceFalloff={0.5} />
      <Vignette darkness={0.35} offset={0.3} />
    </EffectComposer>
  )
}
""")

    # ScrollSections
    create_file(f"{base}/src/components/ScrollSections.tsx", """import { useRef } from 'react'
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
          trigger: containerRef.current!,
          start: `${i * sectionSize}% top`,
          end: `${(i + 1) * sectionSize}% top`,
          scrub: 0.8,
        },
      })
        .fromTo(inner,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
        )
        .to(inner, { opacity: 1, duration: 0.5 })
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
              <span
                className="text-xs uppercase tracking-[0.3em] font-medium mb-4 block"
                style={{ color: 'var(--color-accent-muted)' }}
              >
                {section.label}
              </span>
            )}
            <h2
              className="text-4xl md:text-6xl font-light mb-6 leading-tight whitespace-pre-line"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {section.title}
            </h2>
            <p className="text-lg text-white/50 leading-relaxed">
              {section.copy}
            </p>
            {section.cta && (
              <a
                href={section.cta.href}
                className="pointer-events-auto inline-block mt-8 px-8 py-3 border border-white/20 text-white text-sm tracking-wider uppercase hover:bg-white/10 transition-colors duration-300"
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
""")

    # LoadingScreen
    create_file(f"{base}/src/components/LoadingScreen.tsx", """import { useState, useEffect } from 'react'
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
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-700 ${
      !active && progress === 100 ? 'opacity-0' : 'opacity-100'
    }`} style={{ background: 'var(--color-bg)' }}>
      <div className="text-center">
        <div className="text-white/30 text-xs tracking-[0.35em] uppercase mb-8">
          Loading Experience
        </div>
        <div className="w-48 h-px bg-white/10 relative overflow-hidden mx-auto">
          <div
            className="absolute inset-y-0 left-0 transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: 'var(--color-accent)',
            }}
          />
        </div>
        <div className="text-white/15 text-[10px] mt-4 tabular-nums">
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  )
}
""")

    # models directory placeholder
    create_file(f"{base}/public/models/.gitkeep", "")

    # TypeScript declarations for drei and postprocessing
    create_file(f"{base}/src/vite-env.d.ts", """/// <reference types="vite/client" />

declare module 'lenis/react' {
  import { ComponentType, ReactNode } from 'react'
  export interface ReactLenisProps {
    root?: boolean
    options?: Record<string, unknown>
    children?: ReactNode
  }
  export const ReactLenis: ComponentType<ReactLenisProps>
  export function useLenis(): unknown
}
""")

    print(f"\n✅ Project scaffolded at ./{project_name}")
    print(f"\nNext steps:")
    print(f"  1. cd {project_name}")
    print(f"  2. npm install")
    print(f"  3. Place your optimized GLB at public/models/product.glb")
    print(f"  4. Update src/experience/ProductModel.tsx to load it")
    print(f"  5. Edit src/config/sections.ts with your content")
    print(f"  6. npm run dev")
    print(f"\n  To deploy: npm run deploy (requires wrangler)")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Scaffold a 3D product website')
    parser.add_argument('name', help='Project name')
    parser.add_argument('--brand', default='Brand', help='Brand name')
    parser.add_argument('--product', default='Product', help='Product name')
    args = parser.parse_args()
    scaffold(args.name, args.brand, args.product)
