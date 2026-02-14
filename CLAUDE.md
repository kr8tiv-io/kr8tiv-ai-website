# Project: kr8tiv AI — 3D Website

## What this is
A premium, Apple-grade 3D product showcase website for kr8tiv AI.
The user scrolls and the camera orbits around a 3D model of the device,
stopping at 5 content sections with HUD info panels that pop out.

## Tech Stack
- Vite + React 19 + TypeScript
- @react-three/fiber (R3F) for 3D rendering
- @react-three/drei for helpers (Environment, Sparkles)
- @react-three/postprocessing for Bloom, SSAO, Vignette, Noise
- GSAP + @gsap/react for scroll-driven animations (ScrollTrigger with pin)
- Lenis for smooth scrolling
- Tailwind CSS v4 for styling
- Firebase Hosting for deployment

## Architecture (two layers)
1. Fixed `<Canvas>` at z-0 covering full viewport — renders 3D scene
2. Scrollable HTML at z-10 — overlay with hero + 5 pinned content sections

## Camera Behavior
- Camera orbits the product on a sphere using spherical coordinates (theta, phi, radius)
- GSAP ScrollTrigger with `scrub: 2.5` maps scroll position to theta (0 -> 2pi)
- Each content section is pinned with ScrollTrigger `pin: true`
- `snap` property creates pause-at-section behavior
- Use a GSAP proxy object ref that `useFrame` reads every frame (NO React re-renders)

## Content Sections (5 rotating with HUD panels)
1. "Signal Processing" -- real-time market analysis (white HUD)
2. "Risk Management" -- multi-layered safety (white HUD)
3. "Intelligence" -- ML-powered alpha detection (white HUD)
4. "Open Source" -- community-driven brand CTA (white HUD)
5. "Connect" -- social links and outro (white HUD)

## Design Language
- Dark theme (#050510 background)
- Amber/gold accent (#d4a853) -- ONLY color accent
- HUD color: #ffffff (white at various opacities)
- Display font: Syne (Google Fonts)
- Body font: Inter
- Mono font: JetBrains Mono
- Premium, Apple-level aesthetic with sci-fi HUD overlay
- Cinematic intro sequence with text fade + camera zoom

## GitHub
- Organization: https://github.com/kr8tiv-io
- Deploy target: Firebase Hosting
