# Claude Code "God Mode" — Full Autonomous Build & Deploy to Firebase

This is the exact setup and prompt to give Claude Code (Opus 4.6) to autonomously scaffold, build, and deploy the entire 3D product website to Firebase Hosting using your CLI.

---

## Prerequisites (do these once manually)

```bash
# 1. Install Claude Code (if not already)
npm install -g @anthropic-ai/claude-code

# 2. Install Firebase CLI
npm install -g firebase-tools

# 3. Login to Firebase
firebase login

# 4. Create a Firebase project (or use existing)
firebase projects:create kr8tiv-jarvis
# OR use the web console: https://console.firebase.google.com

# 5. Install gltf-transform for model optimization
npm install -g @gltf-transform/cli

# 6. Have your product video or best-frame image ready
# e.g., ~/Desktop/jarvis-device.png
```

---

## Option A: Quick Setup — Just the Prompt

Open Claude Code in your project directory and paste this:

```bash
claude --dangerously-skip-permissions
```

Then paste the mega-prompt below.

---

## Option B: Full Setup with CLAUDE.md + Skills (Recommended)

### Step 1: Create the project directory

```bash
mkdir kr8tiv-jarvis && cd kr8tiv-jarvis
```

### Step 2: Create CLAUDE.md (project instructions)

Create this file at `kr8tiv-jarvis/CLAUDE.md`:

```markdown
# Project: kr8tiv AI — JARVIS 3D Product Website

## What this is
A premium, Apple-grade 3D product showcase website for the JARVIS device by kr8tiv AI.
The user scrolls and the camera orbits around a photorealistic 3D model of the device,
stopping at 5 content sections with text that fades in/out.

## Tech Stack (DO NOT deviate)
- Vite + React 19 + TypeScript
- @react-three/fiber (R3F) for 3D rendering
- @react-three/drei for helpers (Environment, useGLTF, MeshReflectorMaterial)
- @react-three/postprocessing for Bloom, SSAO, Vignette
- GSAP + @gsap/react for scroll-driven animations (ScrollTrigger)
- Lenis for smooth scrolling
- Tailwind CSS v4 for styling
- Firebase Hosting for deployment

## Architecture (two layers)
1. Fixed `<Canvas>` at z-0 covering full viewport — renders 3D scene
2. Scrollable HTML at z-10 — overlay with 5 content sections (each 100vh)

## Camera Behavior
- Camera orbits the product on a sphere using spherical coordinates (theta, phi, radius)
- GSAP ScrollTrigger with `scrub: 1.5` maps scroll position to theta (0 → 2π)
- `snap` property creates pause-at-section behavior
- Use a GSAP proxy object ref that `useFrame` reads every frame (NO React re-renders)

## Photorealism Requirements
- `<Environment preset="studio" />` for HDR IBL lighting
- PBR materials with proper metalness/roughness
- Post-processing: Bloom (luminanceThreshold: 1.1), N8AO, Vignette
- MeshReflectorMaterial ground plane
- Camera FOV: 35 (telephoto lens feel)
- Dark background: #050510

## Content Sections
1. "Introducing JARVIS" — hero, dramatic
2. "Signal Processing" — real-time market analysis
3. "Risk Management" — multi-layered safety
4. "Intelligence" — ML-powered alpha detection
5. "The Future is Autonomous" — brand CTA (kr8tiv AI)

## Design Language
- Dark theme (#050510 background)
- Amber/gold accent (#d4a853)
- Display font: Syne (Google Fonts)
- Body font: Inter
- Uppercase tracking labels
- Alternating left/right text alignment
- Pointer-events: none on sections, re-enabled on CTAs
- Premium, Apple-level aesthetic — confident, spare, no fluff

## Firebase Setup
- Public directory: dist
- Single-page app: yes (rewrite all URLs to /index.html)
- firebase.json with caching headers for GLB files (max-age: 31536000, immutable)

## Common Gotchas to Avoid
- Use `useGSAP` from @gsap/react (NOT raw useEffect) for GSAP cleanup
- Sync Lenis with GSAP ticker: `gsap.ticker.lagSmoothing(0)` is CRITICAL
- Set Lenis `syncTouch: false` for mobile
- The Draco decoder needs a path or CDN URL
- useFrame only works INSIDE <Canvas> children
- Lazy-load the Canvas with React.lazy for fast LCP
```

### Step 3: Create .claude/settings.json (permissions)

```bash
mkdir -p .claude
```

Create `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm *)",
      "Bash(npx *)",
      "Bash(node *)",
      "Bash(firebase *)",
      "Bash(gltf-transform *)",
      "Bash(mkdir *)",
      "Bash(cp *)",
      "Bash(mv *)",
      "Bash(rm *)",
      "Bash(cat *)",
      "Bash(ls *)",
      "Bash(echo *)",
      "Bash(cd *)",
      "Bash(git *)",
      "Bash(ffmpeg *)",
      "Write(*)",
      "Read(*)"
    ],
    "deny": []
  }
}
```

### Step 4: Copy the skill into Claude Code's skills directory

```bash
mkdir -p .claude/skills
cp -r /path/to/3d-product-website .claude/skills/
```

---

## The Mega-Prompt

Launch Claude Code and paste this:

```
claude --dangerously-skip-permissions
```

Then when Claude Code is running, paste:

```
Build me a complete, production-ready 3D product website for "JARVIS" by "kr8tiv AI" and deploy it to Firebase Hosting. Follow the CLAUDE.md instructions exactly.

Here's what I need you to do autonomously, in order:

## Phase 1: Scaffold
1. Initialize a Vite + React + TypeScript project
2. Install all dependencies: @react-three/fiber, @react-three/drei, @react-three/postprocessing, three, gsap, @gsap/react, lenis, tailwindcss, @tailwindcss/vite
3. Configure vite.config.ts with React plugin + Tailwind plugin + manual chunks for three/r3f/gsap
4. Set up Tailwind v4 in index.css with Lenis CSS import

## Phase 2: Build the 3D Experience
5. Create the two-layer architecture in App.tsx:
   - Fixed <Canvas> at z-0 with camera position [0, 1.5, 5], FOV 35, dpr [1,2]
   - ReactLenis wrapper at z-10 with lerp: 0.07, syncTouch: false
   - Lazy-loaded Experience component
   - LoadingScreen overlay

6. Create experience/Experience.tsx:
   - Environment preset="studio"
   - Ambient light (0.15), directional light, warm spotlight
   - CameraRig, ProductModel, Ground, Effects components

7. Create experience/CameraRig.tsx:
   - GSAP proxy object ref pattern (useRef with theta, phi, radius, targetY)
   - useGSAP hook with ScrollTrigger timeline
   - scrub: 1.5, snap to 5 positions
   - useFrame reads proxy and sets camera position using spherical→cartesian math
   - Full 360° orbit (theta 0 → 2π)

8. Create experience/ProductModel.tsx:
   - For now, create a placeholder that matches the JARVIS device shape:
     - Wide, low, boxy shape (2.4 x 0.6 x 1.6)
     - Dark metallic material (metalness 0.9, roughness 0.15)
     - Transparent glass top surface
     - Glowing amber edge light strip (emissive, toneMapped: false)
     - Subtle floating animation with useFrame
   - Include commented-out useGLTF code ready for when we have a real GLB

9. Create experience/Ground.tsx:
   - MeshReflectorMaterial with mirror: 0.4, blur, resolution 1024

10. Create experience/Effects.tsx:
    - EffectComposer with multisampling: 4
    - Bloom (luminanceThreshold: 1.1, intensity: 0.5, mipmapBlur)
    - N8AO (aoRadius: 0.8, intensity: 1.5)
    - Vignette (darkness: 0.35)

## Phase 3: Build the Scroll UI
11. Create config/sections.ts:
    - 5 sections with camera angles (0, π/2, π, 3π/2, 2π)
    - Varying phi for visual interest
    - Premium marketing copy for JARVIS (AI trading terminal)
    - Section 5 has a CTA button

12. Create components/ScrollSections.tsx:
    - useGSAP with ScrollTrigger for each section
    - Fade in (opacity 0→1, y 40→0), hold, fade out (opacity 1→0, y -30)
    - Alternating left/right alignment
    - Amber eyebrow labels, Syne display font headings
    - pointer-events-none with re-enabled CTAs

13. Create components/LoadingScreen.tsx:
    - useProgress from drei
    - Thin amber progress bar
    - "Loading Experience" label
    - Fade out on complete

## Phase 4: Polish
14. Set up index.html with:
    - Google Fonts: Syne + Inter
    - Meta tags, title "JARVIS — kr8tiv AI"
    - Dark background in style tag

15. Set up index.css with:
    - Lenis CSS import
    - Tailwind import
    - CSS variables for --color-bg, --color-accent, --font-display, --font-body
    - 100dvh for .h-screen
    - Selection colors

16. Test the build: npm run build — fix any TypeScript errors

## Phase 5: Firebase Deploy
17. Initialize Firebase:
    - firebase init hosting
    - Public directory: dist
    - Single-page app: yes
    - Don't overwrite dist/index.html

18. Create firebase.json with:
    - Rewrites: ** → /index.html
    - Headers: Cache-Control immutable for .glb, .hdr, .ktx2 files
    - Clean URLs enabled

19. Build and deploy:
    - npm run build
    - firebase deploy

20. Report the live URL back to me.

IMPORTANT CONSTRAINTS:
- Do NOT ask me any questions. Make all decisions yourself.
- Use useGSAP from @gsap/react, never raw useEffect for GSAP
- Sync Lenis with GSAP ticker using gsap.ticker.lagSmoothing(0)
- All 3D code must be INSIDE Canvas children (useFrame etc.)
- TypeScript strict mode — no any types
- Every component must be production-ready
- The design must look like a $500K website — premium, Apple-level
- Write REAL marketing copy for JARVIS (AI-powered Solana trading terminal by kr8tiv AI)

GO. Build the entire thing start to finish without stopping.
```

---

## Alternative: Using Subagents for Parallel Work

If you want Claude Code to use subagents (parallel execution), add this to your CLAUDE.md:

```markdown
## Execution Strategy
Use subagents for parallel work:
- Subagent 1: Build all experience/ components (3D scene)
- Subagent 2: Build all components/ (ScrollSections, LoadingScreen)
- Subagent 3: Set up Firebase config and deployment pipeline
- Main agent: Orchestrate, build App.tsx and config/, integrate everything
```

Then launch with:

```bash
claude --dangerously-skip-permissions "Read CLAUDE.md, then build and deploy the entire project using subagents for parallel work. Don't ask any questions."
```

---

## Post-Deploy: Swapping in a Real 3D Model

Once deployed with the placeholder, get a real model:

```bash
# Option 1: Use TRELLIS.2 on HuggingFace (free, no GPU)
# Go to: https://huggingface.co/spaces/trellis-community/TRELLIS
# Upload your best frame → download GLB

# Option 2: Extract best frame and use locally
ffmpeg -i jarvis-video.mp4 -vf "select=eq(n\,72)" -vframes 1 best_frame.png

# Optimize the downloaded model
gltf-transform optimize downloaded.glb public/models/product.glb \
  --compress draco --texture-compress webp --texture-resize 1024

# Then tell Claude Code to swap it in:
claude "Replace the placeholder box in ProductModel.tsx with useGLTF loading /models/product.glb. Keep the floating animation. Update the scale to fit properly."

# Redeploy
firebase deploy
```

---

## Monitoring the Autonomous Build

While Claude Code runs in god mode:

```bash
# In another terminal, watch the file system
watch -n 1 'find src -name "*.tsx" -o -name "*.ts" | head -30'

# Or watch the build output
npm run dev  # in another terminal to see live preview
```

If anything goes wrong, hit `Escape` twice in Claude Code to rewind to a checkpoint.

---

## Cost Estimate

- Claude Code with Opus 4.6: ~$5-15 in API tokens for the full build
- Firebase Hosting: Free (10GB storage, 360MB/day transfer on Spark plan)
- Firebase Blaze plan (recommended for production): Pay-as-you-go, still very cheap
- Everything else: $0

---

## The "Ralph" Loop (Optional — Continuous Autonomous Improvement)

If you want Claude to keep iterating and improving the site autonomously:

```bash
# Install Ralph
git clone https://github.com/frankbria/ralph-claude-code
cd ralph-claude-code && ./install.sh

# Go back to your project
cd ~/kr8tiv-jarvis
ralph-enable

# Create improvement tasks
ralph-import improvements.md

# Let Claude loop autonomously
ralph --monitor
```

Where `improvements.md` contains:
```
- Improve mobile responsiveness for the 3D scroll experience
- Add a navigation bar with glass morphism effect
- Add particle effects around the JARVIS device
- Optimize loading performance to hit 90+ Lighthouse score
- Add smooth page transitions between sections
- Add a "waitlist" form section at the bottom
```
