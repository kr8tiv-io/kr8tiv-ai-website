---
id: "004"
title: Mobile perf tier (poster first, no HDR on phones) and reduced-motion fallback
kind: build
effort: xhigh
model: grok-4.7-build-fast
depends_on: []
checks: [poster-tier, reduced-motion]
lighthouse: true
---
# 004: Poster tier, lighter environment, fast first paint, reduced motion (brief section 4 decision tree, S5, S7, S8; audit P1-3, P1-6, P2-4)

Read `build-plan/CONTEXT.md` first.

## Goal
Lighthouse mobile is 32 on home. Phones download three.js + R3F + GSAP (~360 KB gz) and a 1.39 MB `public/hdr/studio_small_03_1k.hdr`, then show ~4 s of black before the dome pops in. `prefers-reduced-motion` still runs the animated canvas. Make phones and reduced-motion users get a polished static poster with no 3D download, and make capable devices fade into WebGL without a black frame.

## Must haves
- Capability decision (in `src/hooks/useDeviceCapability.ts` / `src/App.tsx`): a `poster` tier used when ANY of: viewport width < 768, `prefers-reduced-motion: reduce`, `navigator.connection?.saveData`, `navigator.deviceMemory <= 4` (when reported), no WebGL, WebGL context lost, or the first WebGL frame not ready within ~1000 ms of the canvas mounting (then stay on the poster). Decide synchronously on first render where possible so phones never start the WebGL path.
- In the poster tier: do NOT render `<Scene3D>`, do NOT import three / r3f / drei / the Experience chunk / the HDR (verify in the network log), and do not start Lenis or scroll-scrubbed camera code. The poster (`public/fallback-scene.jpg`, served with `fetchpriority="high"`) is visible at first paint. Give it a mobile-sized variant: add `public/fallback-scene-mobile.webp` (and keep the JPEG as fallback) generated from the existing JPEG at <= 120 KB, using a `<picture>`/`srcset`. If you cannot generate WebP locally without new tooling, use `npx --yes sharp-cli` or a small Node script with a temporary `npx` package (do NOT add it to package.json); if that fails, keep the JPEG and note it in the commit body.
- WebGL tier (desktop/capable tablets): lazy-load the 3D chunk after first paint/idle (it already is lazy; keep it so). Replace the 1.39 MB HDR with a generated environment: drei `<Environment>` with `<Lightformer>`s or three's `RoomEnvironment` through PMREM, so no `.hdr` file is requested by any tier. Keep the look close to today (same key light direction, similar reflections on the gold strip). Leave the `.hdr` file in `public/` only if something still references it; otherwise delete it.
- No pop-in (S7): the poster stays until the first WebGL frame has rendered, then crossfades in <= 400 ms. No black hero frames.
- Reduced motion (S8, P2-4): with `prefers-reduced-motion: reduce` there is no `<canvas>` at any viewport, no Lenis, no intro sequence, no scroll-scrubbed animation; content is fully visible without scrolling animations.
- Keep the hero text as the LCP element on phones.

## Files
- `src/hooks/useDeviceCapability.ts`, `src/App.tsx`, `src/experience/Scene3D.tsx`, `src/experience/Experience.tsx`, `src/components/HeroOverlay.tsx` (only if needed for LCP), `index.html` (preload hints only), `public/fallback-scene-mobile.webp` (new), `public/hdr/` (remove if unused), `vite.config.ts` (only chunking if needed).

## Non-goals
- Do not change the scroll structure on mobile (005), the type sizes (006), or the copy. Do not touch `.htaccess` (009).
- No new runtime npm dependencies.

## Verification
- `npm run build` passes.
- `node build-plan/verify/verify.mjs --checks nav,scrim,shader-src,poster-tier,reduced-motion --lighthouse` passes:
  - `poster-tier`: at 390x844 home has no `<canvas>`, no request to `.hdr`, `three-*.js`, `r3f-*.js` or `Experience-*.js`, and the poster image is visible within 1 s.
  - `reduced-motion`: with `reducedMotion: 'reduce'` at 390 and 1440, `document.querySelectorAll('canvas').length === 0` after 3 s and the poster is visible.
  - At 1440 the WebGL scene still renders (a canvas exists) with no console errors and no `.hdr` request.
  - Lighthouse mobile on home is printed; aim for Performance >= 80 (record the number in the commit body).

## Commit message
```
perf(home): poster tier for phones/reduced-motion, no HDR, crossfade into WebGL (004)
```
