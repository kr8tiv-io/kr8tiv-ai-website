# Project: kr8tiv AI — JARVIS 3D Product Website

## What this is
A premium, Apple-grade 3D product showcase website for the JARVIS device by kr8tiv AI.
The user scrolls and the camera orbits around a 3D model of the device,
stopping at 4 content sections with HUD info panels that pop out.

## Tech Stack
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
2. Scrollable HTML at z-10 — overlay with hero + 4 content sections (each 100vh)

## Camera Behavior
- Camera orbits the product on a sphere using spherical coordinates (theta, phi, radius)
- GSAP ScrollTrigger with `scrub: 1.5` maps scroll position to theta (0 → 2π)
- `snap` property creates pause-at-section behavior
- Use a GSAP proxy object ref that `useFrame` reads every frame (NO React re-renders)

## Content Sections (4 rotating with HUD panels)
1. "Signal Processing" — real-time market analysis (cyan HUD)
2. "Risk Management" — multi-layered safety (orange HUD)
3. "Intelligence" — ML-powered alpha detection (purple HUD)
4. "The Future is Autonomous" — brand CTA (amber HUD)

## Design Language
- Dark theme (#050510 background)
- Amber/gold accent (#d4a853)
- HUD color: #00e5ff (cyan)
- Display font: Syne (Google Fonts)
- Body font: Inter
- Mono font: JetBrains Mono
- Premium, Apple-level aesthetic with sci-fi HUD overlay

## GitHub
- Organization: https://github.com/kr8tiv-io
- Deploy target: Firebase Hosting
