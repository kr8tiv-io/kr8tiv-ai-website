---
id: "006"
title: Type scale minimums and tap-target sizes
kind: build
effort: xhigh
model: grok-4.7-build-fast
depends_on: ["001"]
checks: [tiny-text, tap-targets]
lighthouse: true
---
# 006: Readable type and real tap targets (brief M4, M5; audit P2-2, P2-3)

Read `build-plan/CONTEXT.md` first.

## Goal
Home uses 8-10px labels, eyebrows, nav and buttons (`text-[8px]`, `text-[9px]`, `text-[10px]` across `HeroOverlay.tsx`, `ScrollSections.tsx`, `LoadingScreen.tsx`, `VibesButton.tsx`, `HudPanel.tsx`); subpages use 9-10px `dt`/`small`/eyebrows. Social icons are 14x14 px and footer links 15 px tall.

## Must haves
- Minimums on every page and viewport: no visible text below 12px; labels/eyebrows >= 12px; nav items and buttons >= 14px; body copy >= 16px on mobile. Reduce letter-spacing on mono caps below 640px (<= 0.12em).
- Tap targets: every visible link/button is at least 24x24 CSS px (WCAG 2.2 minimum); header/menu items, footer links, social icons and all CTAs are at least 44x44 (padding, not bigger glyphs). Inline links inside paragraphs are exempt.
- Contrast: labels and secondary text >= 4.5:1 on `#050510` (raise `text-white/20`-`/40` style values as needed; e.g. white at >= 0.6 alpha for small text). Subpage `dt` labels, tagline and nav links included.
- Purely decorative micro-text (corner coordinates, "SCROLL - WATCH IT WORK" style lines) may be removed or enlarged; do not remove meaningful copy.
- Apply the same rules to `public/styles/page.css` for the subpages.

## Files
- `src/components/*.tsx`, `src/components/ui/HudPanel.tsx`, `src/index.css`, `src/config/theme.ts`, `public/styles/page.css`, the three subpage HTML files only for class tweaks.

## Non-goals
- No layout or 3D work, no copy rewrites, no HUD removal (008).

## Verification
- `npm run build` passes.
- `node build-plan/verify/verify.mjs --checks nav,scrim,shader-src,poster-tier,reduced-motion,scroll-height,tiny-text,tap-targets --lighthouse` passes (`tiny-text`: no visible text node < 12px on any page/viewport; `tap-targets`: every visible a/button not inside a <p> is >= 24x24, header/menu items >= 44px tall at 390).
- Lighthouse mobile `target-size` and `color-contrast` audits pass on home (printed by the verifier).

## Commit message
```
fix(a11y): 12px+ text, 14px+ controls, 44px tap targets, AA contrast (006)
```
