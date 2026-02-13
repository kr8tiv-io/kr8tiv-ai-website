---
name: 3d-product-website
description: Build Apple-grade, photorealistic 3D product showcase websites with scroll-driven camera orbits from a video or image of a physical product. Use this skill whenever the user wants to create a 3D website, product landing page, immersive product tour, scroll-animated 3D experience, GSAP scroll-driven 3D scene, or anything involving Three.js / React Three Fiber with scroll animations. Also trigger when the user mentions converting a video or image into a 3D web experience, building an Apple-style product page, or creating a website where you scroll around a 3D object. Even if the user just says "make my product look premium on a website" or "I want a website like Apple's" — use this skill.
---

# 3D Product Website Builder

Build stunning, scroll-animated 3D product showcase websites — the kind that look like they cost $500K — using free AI tools and open-source libraries. Takes a video or image of a product and produces a fully deployed website with a camera that orbits the 3D model as the user scrolls, stopping at content sections.

## When to use this skill

- User has a video or image of a product and wants a 3D website
- User wants an Apple-style product page with scroll animations
- User wants a GSAP + Three.js / React Three Fiber scroll experience
- User mentions "3D website", "product showcase", "scroll orbit", "immersive product tour"
- User wants to convert video/image to a 3D web experience

## Overview of the pipeline

The full workflow has 4 phases:

1. **3D Model** — Get or create a GLB/GLTF model of the product
2. **Optimize** — Compress for web (target < 5MB)
3. **Build** — React Three Fiber + GSAP ScrollTrigger + Lenis smooth scroll
4. **Deploy** — Cloudflare Pages (free, unlimited bandwidth)

Read `references/pipeline-guide.md` for the complete step-by-step pipeline with exact commands and tools for each phase.

## Tech stack (all free)

| Layer | Package | Purpose |
|-------|---------|---------|
| Framework | Vite + React (or Next.js) | App shell |
| 3D Renderer | `@react-three/fiber` | Declarative Three.js |
| 3D Helpers | `@react-three/drei` | Environment maps, useGLTF, Float, etc. |
| Post-processing | `@react-three/postprocessing` | Bloom, SSAO, vignette |
| Scroll animation | `gsap` + `@gsap/react` | ScrollTrigger (free since Webflow acquisition) |
| Smooth scroll | `lenis` | Butter-smooth scrolling |
| Styling | Tailwind CSS | Rapid, responsive design |
| Hosting | Cloudflare Pages + R2 | Free, unlimited bandwidth |

## Building the website

When the user is ready to build, follow this architecture. Read `references/architecture.md` for the complete component structure, camera orbit math, scroll snap configuration, and text reveal patterns.

### Project setup

```bash
npm create vite@latest project-name -- --template react-ts
cd project-name
npm install @react-three/fiber @react-three/drei @react-three/postprocessing three gsap @gsap/react lenis
npm install -D tailwindcss @tailwindcss/vite
```

### Core architecture (two layers)

**Layer 1 — Fixed 3D Canvas** (position: fixed, z-index: 0)
A full-viewport `<Canvas>` that renders the 3D model with studio lighting. The camera orbits the model based on scroll position using spherical coordinates driven by GSAP ScrollTrigger.

**Layer 2 — Scrollable HTML** (position: relative, z-index: 10)
Standard HTML sections (each `100vh`) overlaid on the canvas with `pointer-events: none` (re-enabled on interactive elements). Each section has text that fades in/out as the user scrolls. The scroll distance drives both the camera orbit AND the text reveals simultaneously.

### Camera orbit mechanism

The camera moves on a sphere around the product using spherical coordinates:
- `theta` (horizontal angle) — driven by scroll progress from 0 → 2π (full 360° orbit)
- `phi` (vertical angle) — slight variation per section for visual interest
- `radius` — constant distance, adjustable per section for zoom effects

GSAP ScrollTrigger `scrub` maps scroll position to animation progress. The `snap` property creates Apple-style "pause at each section" behavior. See `references/architecture.md` for full implementation.

### Photorealism checklist

These five elements make the difference between "looks like a demo" and "looks like $500K":

1. **HDR Environment Map** — `<Environment preset="studio" />` from drei provides physically accurate reflections from one line of code
2. **PBR Materials** — Metalness, roughness, normal maps must be on the model
3. **Post-processing** — Bloom (luminanceThreshold: 1.1, intensity: 0.5), N8AO (ambient occlusion), Vignette (darkness: 0.3)
4. **Reflective ground plane** — `<MeshReflectorMaterial>` from drei for that premium surface
5. **Proper camera FOV** — 35° for product shots mimics a real telephoto lens

### Content sections config

```typescript
const sections = [
  { angle: 0,            phi: Math.PI/2.5, title: "Meet [Product]",    copy: "..." },
  { angle: Math.PI/2,    phi: Math.PI/2.2, title: "Engineered for...", copy: "..." },
  { angle: Math.PI,      phi: Math.PI/3,   title: "Under the hood",    copy: "..." },
  { angle: 3*Math.PI/2,  phi: Math.PI/2.5, title: "Built to last",     copy: "..." },
  { angle: 2*Math.PI,    phi: Math.PI/2.5, title: "Get yours",         copy: "..." },
]
```

## Common gotchas (save yourself hours of debugging)

- **GSAP + React StrictMode**: Use `useGSAP` hook from `@gsap/react` — handles cleanup and prevents duplicate ScrollTriggers from double-renders
- **Draco decoder path**: Host the Draco WASM decoder files or point to `https://www.gstatic.com/draco/versioned/decoders/1.5.7/`. Missing decoder = silent model loading failure
- **Mobile scroll jank**: Set Lenis `syncTouch: false` and `ScrollTrigger.normalizeScroll(true)` to prevent address bar resize issues
- **Canvas CLS**: Set explicit width/height on the Canvas container (`w-full h-screen` in Tailwind)
- **Memory leaks**: Call `useGLTF.clear()` when dynamically loading/unloading models
- **Flat-looking PBR**: Without an HDR environment map, PBR materials look plastic. Environment is the #1 thing people forget
- **useFrame outside Canvas**: The `useFrame` hook only works inside `<Canvas>`. Camera animation logic must be in a component that is a child of Canvas

## Reference files

Read these for complete implementation details:

- `references/pipeline-guide.md` — Full video-to-website pipeline with exact commands, tool choices, and timing
- `references/architecture.md` — Complete component code, camera math, GSAP timeline, Lenis sync, mobile strategy
- `references/ai-prompts.md` — Copy-paste prompts for Claude/Gemini/v0 to generate each component
- `references/model-sources.md` — How to create 3D models from video/image using free AI tools (TRELLIS.2, Nerfstudio, Hunyuan3D, etc.)
- `references/claude-code-automation.md` — **Full autonomous build & deploy with Claude Code "god mode"** — includes the CLAUDE.md project file, .claude/settings.json permissions, the mega-prompt, Firebase deployment, and the Ralph loop for continuous improvement
