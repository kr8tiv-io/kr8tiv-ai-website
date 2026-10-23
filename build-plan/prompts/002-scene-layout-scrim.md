---
id: "002"
title: 3D layout so content never sits under the model, plus a content scrim
kind: build
effort: xhigh
model: grok-4.7-build-fast
depends_on: []
checks: [scrim]
lighthouse: false
---
# 002: Keep the 3D scene out of the text (brief M3, S6, S9; audit P1-1, P2-1)

Read `build-plan/CONTEXT.md` first.

## Goal
On every home section the plinth, robot arm, wire dome, neon logo and the in-scene HUD sit directly behind headings, paragraphs and CTAs, worst on tablet (see `C:\Users\lucid\Desktop\kr8-ref\shots\frames\home-tablet-s09.png`, `home-desktop-s07.png`, `home-desktop-s18.png`, `home-mobile-s01.png`). Make text always readable: the model is placed beside or above the text column, never behind it, and every text block over the scene sits on a scrim.

## Must haves
- Camera / model framing (`src/experience/CameraRig.tsx`, `src/config/sections.ts`, `src/experience/Experience.tsx`): per section, offset the model so it renders in the half of the viewport opposite the text column at >= 1024px (text left -> model right, and vice versa). At 768-1023px put the model in the top ~40% of the viewport and the text panel in the lower part, or fade the scene to <= 15% opacity behind the panel. After the last data section (footer / CTA), park or fade the scene so the footer reads on a plain background.
- Content scrim: every section text block on the home page (hero copy, `.section-inner` blocks, the footer CTA) gets a wrapper with `data-scrim` and a solid or gradient background with at least 0.55 alpha of `#050510` (plus optional `backdrop-filter: blur()`), padding, and rounded corners consistent with the HUD style. Target >= 4.5:1 text contrast against the brightest frame behind it.
- In-scene HUD stat cards (`src/components/ui/HudPanel.tsx`) must never be occluded by geometry and never overlap the text panel or CTA buttons at 768 or 1440 (DOM overlay positioned in the free column, or hidden below 1024). Do not delete their content here (prompt 008 does that).
- Seams (S9 / P2-1): no hard horizontal band across the scene while scrolling. Section backgrounds are transparent or feathered with gradient masks.
- Mobile (< 768) keeps working; if the model would cover text there, push it above the text or fade it. (Prompt 004 will move phones to a static poster, so keep the mobile change minimal.)

## Files
- `src/experience/CameraRig.tsx`, `src/experience/Experience.tsx`, `src/experience/OpsMachine.tsx` / `ProductModel.tsx` only for position/scale, `src/config/sections.ts` (layout fields only, NOT copy), `src/components/ScrollSections.tsx`, `src/components/HeroOverlay.tsx`, `src/components/ui/HudPanel.tsx`, `src/index.css`.

## Non-goals
- No shader changes (003), no tiering/perf work (004), no scroll-length changes (005), no copy changes, no removal of HUD content (008).

## Verification
- `npm run build` passes.
- `node build-plan/verify/verify.mjs --checks nav,scrim` passes (the `scrim` check: at 768 and 1440 every visible heading/paragraph in the home sections has an ancestor with `data-scrim` whose background alpha >= 0.55 or a background-image).
- Screenshots in `C:\Users\lucid\Desktop\kr8tiv-ai-runs\` at 768 and 1440 (scroll stops) show no model, logo or HUD card behind text or buttons. Check them yourself and iterate.

## Commit message
```
feat(layout): keep the 3D scene beside the copy and add content scrims (002)
```
