---
id: "005"
title: Shorten the mobile scroll and remove empty stops
kind: build
effort: xhigh
model: grok-4.7-build-fast
depends_on: []
checks: [scroll-height]
lighthouse: false
---
# 005: Mobile/tablet home is normal flow (brief M2; audit P1-3)

Read `build-plan/CONTEXT.md` first.

## Goal
The mobile home page is ~21,700 px tall (~26 screens) and about a third of the scroll stops show no readable content (`C:\Users\lucid\Desktop\kr8-ref\shots\home-mobile-scroll-contact-sheet.png`). Below 1024px, sections must be normal-flow blocks sized to their content.

## Must haves
- In `src/components/ScrollSections.tsx` and `src/components/HeroOverlay.tsx`: below 1024px (use `gsap.matchMedia()` or an equivalent breakpoint switch) there is no `pin`, no `pinSpacing`, no `h-screen` spacer section, and no scroll-scrubbed fade in/out of text. Sections use content height with consistent vertical padding (e.g. 56-80px). Optional: a light one-shot fade/slide-in on enter (disabled under reduced motion).
- Remove the empty `h-screen` spacer section(s) at all widths if they only exist to create dwell time; on >= 1024px the pinned choreography may stay but must not produce scroll stops with no readable content.
- Hero on mobile: no full black/empty first screen; the headline, sub-copy and CTA are visible at first paint above the fold at 390x844.
- The camera rig must not break when sections are not pinned (if the WebGL tier runs on a tablet in portrait, map camera progress to normal scroll progress or keep the camera static).
- Mobile home `document.documentElement.scrollHeight` <= 7,000 px at 390x844 and <= 8,000 px at 768x1024, without deleting any copy.

## Files
- `src/components/ScrollSections.tsx`, `src/components/HeroOverlay.tsx`, `src/experience/CameraRig.tsx` (only for the no-pin case), `src/App.tsx` (only if ScrollTrigger/Lenis setup must change), `src/index.css`.

## Non-goals
- No copy changes, no removal of sections, no type-size work (006), no HUD content removal (008). Desktop (>= 1024) look stays as is apart from removing empty stops.

## Verification
- `npm run build` passes.
- `node build-plan/verify/verify.mjs --checks nav,scrim,shader-src,poster-tier,reduced-motion,scroll-height` passes (`scroll-height`: home scrollHeight <= 7000 at 390x844 and <= 8000 at 768x1024; at 390 every viewport-height scroll stop contains visible text).
- Check the 390 scroll-stop screenshots in `C:\Users\lucid\Desktop\kr8tiv-ai-runs\`.

## Commit message
```
feat(mobile): normal-flow home sections below 1024px, no empty scroll stops (005)
```
