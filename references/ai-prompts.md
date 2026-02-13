# AI Prompts Reference — Generating 3D Website Code with AI

Exact copy-paste prompts for Claude, Gemini, and v0.dev to generate each component of the 3D scroll website. The key insight: **always ask AI to write a plan/spec first, then implement it.** This produces dramatically better Three.js/R3F code.

---

## The Two-Step Technique (Critical)

Never ask an AI to write the full 3D website in one shot. Instead:

**Step 1 — Planning prompt** (paste this first):
```
I'm building an Apple-style product showcase for [BRAND NAME] — a [describe product shape, size, material]. The site uses React Three Fiber, GSAP ScrollTrigger, and Lenis smooth scroll. It loads a GLB model, orbits the camera around it as the user scrolls through 5 sections, and has scroll-triggered content sections that snap to specific viewing angles.

Don't write any code yet. Write a detailed implementation specification covering:
1. Component architecture and file structure
2. State management approach (GSAP proxy object pattern)
3. Camera orbit math (spherical coordinates)
4. GSAP ScrollTrigger timeline structure with snap points
5. Lenis + GSAP ticker sync approach
6. Section fade-in/out timing
7. Post-processing pipeline
8. Performance budget and optimization strategy
9. Mobile fallback approach

Be specific about numbers: camera positions, FOV, scroll distances, animation durations.
```

**Step 2 — Implementation prompt** (paste after reviewing the spec):
```
Now implement this specification. Use these exact packages:
- @react-three/fiber@9
- @react-three/drei
- @react-three/postprocessing
- gsap with @gsap/react (useGSAP hook)
- lenis (ReactLenis from 'lenis/react')
- Tailwind CSS

Requirements:
- TypeScript
- Production-ready error handling
- Lazy-loaded Canvas for fast LCP
- useGSAP for proper GSAP cleanup in React
- Spherical coordinate camera orbit driven by ScrollTrigger scrub
- Snap to 5 camera positions
- Content sections with staggered text reveals
- Studio HDR environment for photorealistic lighting
- Bloom + AO + Vignette post-processing
- Mobile-aware (reduce effects on low-tier devices)

Start with App.tsx, then each file in order.
```

---

## Component-Specific Prompts

### Camera Rig prompt
```
Write a React Three Fiber CameraRig component that:
- Uses spherical coordinates (theta, phi, radius) to position the camera on a sphere around origin
- GSAP ScrollTrigger with scrub:1.5 drives theta from 0 to 2π (full orbit)
- Has snap points at 0, π/2, π, 3π/2, 2π
- phi varies slightly per section for visual interest
- Uses a GSAP proxy object (useRef) that useFrame reads every frame
- Smooth interpolation, no jitter
- Uses useGSAP hook for proper React cleanup

The proxy object pattern: GSAP animates a plain object, useFrame reads it and updates camera.position each frame. This avoids React re-renders.
```

### Scroll Sections prompt
```
Write a ScrollSections component for an Apple-style product page:
- 5 sections, each 100vh, overlaid on a fixed 3D canvas
- Each section has: eyebrow label, large heading, body text, optional CTA
- Sections alternate left/right alignment
- Text fades in (opacity 0→1, y 40→0) as user scrolls into section
- Text holds visible in the middle of the section
- Text fades out (opacity 1→0, y 0→-30) as user scrolls past
- Use GSAP ScrollTrigger with scrub for scroll-driven fade
- Pointer-events: none on sections (re-enable on CTAs)
- Dark theme, white text, amber accent color
- Tailwind CSS
```

### Post-Processing prompt
```
Write a React Three Fiber Effects component using @react-three/postprocessing:
- Bloom with luminanceThreshold: 1.1, intensity: 0.5, mipmapBlur
- N8AO ambient occlusion with aoRadius: 0.8, intensity: 1.5
- Vignette with darkness: 0.35
- Wrap in EffectComposer with multisampling: 4
- Accept a 'tier' prop to disable effects on mobile ('low' tier)
```

### Loading Screen prompt
```
Write a minimal, premium loading screen for a 3D website:
- Uses useProgress from @react-three/drei to track GLB loading
- Shows a thin horizontal progress bar (amber color on dark background)
- Percentage counter below
- "Loading Experience" text above in uppercase tracking
- Fades out with 700ms opacity transition when complete
- Unmounts after fade-out completes
- z-50 to overlay everything
```

---

## v0.dev Prompts

v0.dev (Vercel) supports React Three Fiber directly. Use these for rapid prototyping:

### Full scene prototype
```
Create a 3D product showcase with React Three Fiber:
- Load a GLB model at center
- Studio HDR environment lighting
- Camera orbits around the model when user scrolls
- 5 scroll sections with text that fades in/out
- Dark theme (#050510 background)
- Amber/gold accent color
- Apple-level premium feel
- Use GSAP ScrollTrigger for scroll animations
```

### Just the 3D scene
```
React Three Fiber scene with:
- Environment preset "studio"
- A placeholder box at center (I'll replace with GLB)
- Reflective ground plane using MeshReflectorMaterial
- Bloom and vignette post-processing
- Camera at position [0, 1.5, 5] with FOV 35
- Dark background #050510
```

---

## Prompt for Content Generation

```
Write premium marketing copy for a hardware product landing page. The product is [PRODUCT NAME] by [BRAND]. It's a [description].

Write 5 sections for an Apple-style scroll experience:
1. Hero introduction — dramatic, one-line hook
2. Core capability — what it does, described poetically
3. Technical differentiator — engineering precision, described accessibly
4. Intelligence/AI angle — the smart features
5. Brand + CTA — closing statement with call to action

Requirements:
- Each section: 1 eyebrow label (2-3 words), 1 title (4-8 words, can be 2 lines), 1 description (2-3 sentences)
- Tone: Apple meets luxury tech. Confident, spare, no fluff
- Never use exclamation marks
- Avoid generic buzzwords. Be specific and evocative
- Titles can use line breaks for dramatic effect
```

---

## Claude Code / Cursor Workflow

For ongoing development in Cursor or Claude Code:

### Initial setup prompt
```
I'm building a 3D product scroll website. The stack is:
- Vite + React + TypeScript
- @react-three/fiber, @react-three/drei, @react-three/postprocessing
- GSAP ScrollTrigger + @gsap/react
- Lenis smooth scroll
- Tailwind CSS

The GLB model is at /public/models/product.glb.

The architecture: fixed Canvas at z-0, scrollable HTML at z-10. Camera orbits the product on a sphere driven by GSAP ScrollTrigger scrub. 5 sections snap to specific angles. Text fades in/out per section.

[Then ask for specific changes or additions]
```

### Debugging prompt
```
My 3D scroll website has [specific issue]. Here's the relevant code:
[paste code]

The symptoms are: [describe what happens vs what should happen]

Stack: R3F + GSAP ScrollTrigger + Lenis. The camera orbit uses a GSAP proxy object read by useFrame.
```
