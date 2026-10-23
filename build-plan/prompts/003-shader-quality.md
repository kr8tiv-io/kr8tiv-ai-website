---
id: "003"
title: "Shader fixes: dither the bands, DPR/antialias, drop the glitch flicker"
kind: build
effort: xhigh
model: grok-4.7-build-fast
depends_on: []
checks: [shader-src]
lighthouse: false
---
# 003: Shader quality (brief S1, S2, S3, S4; audit P1-4, P1-5)

Read `build-plan/CONTEXT.md` first.

## Goal
Remove the visible banding in the "light painting" stream and fog, the stair-stepped/fringed edges on phones and tablets, and the deliberate scan-line / glitch flicker on the neon logo. Evidence: `C:\Users\lucid\Desktop\kr8-ref\shots\home-desktop-fog-banding-crop.png`, `home-tablet-glitch-crop.png`.

## Must haves
- Dithering (S1): in every translucent/additive fragment shader (`src/experience/SmokeStream.tsx`, `src/experience/VolumetricSmoke.tsx`, `src/experience/Kr8tivLogo.tsx`, and the particle/energy shaders in `EnergyLines.tsx`, `Atmosphere.tsx`, `MouseTracers.tsx` if they output low-alpha colour) add a screen-space dither to the final colour, e.g. `gl_FragColor.rgb += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233))) * 43758.5453) - 0.5) / 255.0;` (interleaved-gradient noise is fine too). Keep it inside the shader strings; one shared GLSL snippet constant is fine.
- Remove the `sin(vUv.y * 40.0 ...)` fiber stripes in `SmokeStream.tsx` (or reduce them to a very low-contrast, low-frequency term that cannot step).
- Logo (S3): remove the high-frequency scan-line term (`scanFreq` ~300) and the random `glitch` flicker in `Kr8tivLogo.tsx`. Keep a subtle halo and a slow sweep. No moiré, no flicker.
- DPR / AA (S2): no forced `[1, 1]` DPR. Use `[1, Math.min(devicePixelRatio, 2)]`-style ranges per tier (low tier at least 1.5 when the device ratio allows), enable `antialias` (MSAA) where the tier is not conservative, and add drei `PerformanceMonitor` + `AdaptiveDpr` (or equivalent) so resolution drops before frame rate does. Remove `antialias: false` for the low tier unless a post-pass FXAA/SMAA replaces it (`@react-three/postprocessing` is already a dependency).
- Fog (S4): cap fog layers on medium/low tiers and skip fog when PerformanceMonitor reports a decline.
- No visual regressions in colour, brightness or composition beyond the removed artefacts.

## Files
- `src/experience/SmokeStream.tsx`, `VolumetricSmoke.tsx`, `Kr8tivLogo.tsx`, `EnergyLines.tsx`, `Atmosphere.tsx`, `MouseTracers.tsx`, `Effects.tsx`, `Scene3D.tsx`, `src/App.tsx` (only the `canvasDpr` logic), `src/hooks/useDeviceCapability.ts` (only if needed for AA flags).

## Non-goals
- No poster-tier / HDR / reduced-motion work (004). No layout changes (002). No copy changes. No new npm dependencies.

## Verification
- `npm run build` passes.
- `node build-plan/verify/verify.mjs --checks nav,scrim,shader-src` passes (`shader-src` greps: no `glitch` in Kr8tivLogo.tsx, no `vUv.y * 40.0` in SmokeStream.tsx, `gl_FragCoord` present in SmokeStream.tsx, VolumetricSmoke.tsx and Kr8tivLogo.tsx, no literal `[1, 1]` DPR in App.tsx).
- Inspect the 1440 and 768 screenshots for bands and stair-steps (zoom the top-right stream area).

## Commit message
```
fix(shaders): dither translucent shaders, real DPR/AA, no logo glitch flicker (003)
```
