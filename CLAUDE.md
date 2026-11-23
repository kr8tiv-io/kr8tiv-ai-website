# Project: kr8tiv AI, 3D Website

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
- Hostinger (Git auto-deploy from `master`). A merge to master publishes kr8tiv.ai

## Architecture (two layers)
1. Fixed `<Canvas>` at z-0 covering full viewport: renders 3D scene
2. Scrollable HTML at z-10: overlay with hero + 5 pinned content sections

## Camera Behavior
- Camera orbits the product on a sphere using spherical coordinates (theta, phi, radius)
- GSAP ScrollTrigger with `scrub: 2.5` maps scroll position to theta (0 -> 2pi)
- Each content section is pinned with ScrollTrigger `pin: true`
- `snap` property creates pause-at-section behavior
- Use a GSAP proxy object ref that `useFrame` reads every frame (NO React re-renders)

## Content Sections (6 rotating with HUD panels, defined in src/config/sections.ts)
1. "What We Automate" -- receipts, quoting, dispatch, digests
2. "Case Study - Evolve Eco Blasting" -- the proof, links to /work/evolve/
3. "How It Works" -- agents wired into the client's existing stack
4. "The System" -- Evolve, the business system built for Evolve Eco Blasting (field app, workbook, AI brain, owner dashboard)
5. "What You Own" -- source handover, data in the client's accounts, no lock-in
6. "The Human Part" -- who builds it
Followed by the footer/CTA section (Audit -> Build -> Care ladder).

## Positioning (locked, Matt, 23 Nov 2026)
kr8tiv AI is a PROFESSIONAL SERVICE that businesses hire to build AI automations
and back-office/operational systems, based in Edmonton, Alberta.

- The ONLY product on this site is Evolve, the business system built for and
  proven at Evolve Eco Blasting. Do not add any other product.
- The product name is "Evolve" (Matt, 23 Nov 2026). Never write "Evolved" on this site.
- KIN and JARVIS are retired. Never mention them, link them, or restore
  /kin/ or /jarvis/ (both 301 to / in public/.htaccess).
- Nothing crypto, ever: no on-chain payments, x402, OKX, X Layer, testnet,
  tokens, wallets, staking, DLMM, NFTs, Solana, trading bots or $HOMES, in copy,
  nav, meta, schema, llms.txt or links. Evolve has nothing to do with crypto.
- Socials: LinkedIn (and the KR8TIV AI Facebook Page once its URL is on file).
  No X, no Telegram, no link to the github.com/kr8tiv-ai org page.
- No em or en dashes in any copy. No AggregateRating or star schema.
- Homepage pre-render copy in index.html is generated from sections.ts by
  scripts/sync-static-content.mjs and must stay visible (never clip or
  aria-hide it). People and crawlers see the same words.
- `npm run test:content` must pass before any push.

## Static sub-pages
Plain HTML in public/ (no JS, no 3D, crawlable, shared public/styles/page.css):
/work/evolve/, /start/, 404. Links between pages are RELATIVE so they work
at the site root and on the GitHub Pages subpath preview. From React, link to
them via PAGE_EVOLVE in src/config/sections.ts
(base-URL aware through src/lib/asset.ts).

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
- Deploy target: Hostinger Git auto-deploy on `master`. Work on branches, open a PR, merge only with Matt's yes, back up the live site first
