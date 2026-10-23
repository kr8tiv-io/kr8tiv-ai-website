---
id: "007"
title: Unify the subpage header, footer and design with home
kind: build
effort: xhigh
model: grok-4.7-build-fast
depends_on: ["001"]
checks: [subpage-cls]
lighthouse: true
---
# 007: One brand system across all four pages (brief G5, M7; audit P2-5, P2-6)

Read `build-plan/CONTEXT.md` first.

## Goal
`/work/evolve/`, `/jarvis/`, `/kin/` (hand-written HTML + `public/styles/page.css`) look like a different site from home: different type scale, footer, spacing and tokens. `/work/evolve/` mobile CLS is 0.281 because the Google Fonts swap shifts `<main>`, and the Google Fonts CSS blocks render for ~2 s. Make the subpages share home's header (done in 001), footer, tokens and type scale, and remove the font CLS.

## Must haves
- Tokens: one set of CSS custom properties (colours `#050510`, gold `#d4a853`, text alphas, spacing scale, radii, font stacks, type scale) defined once and used by both home (`src/index.css`) and subpages (`public/styles/page.css`). Duplicate the token block if the two can't share a file, but keep the values identical and add a comment pointing to the twin.
- Footer: subpages get the same footer structure and links as the home footer (same order, labels, `tel:`/`mailto:`/social targets, relative page links), as static HTML.
- Visual match: same header/footer look, headings in Syne, body in Inter, labels in JetBrains Mono, same gold accent usage, same button style as home CTAs. Subpages stay static HTML with no 3D; a static decorative background (CSS gradient, or the poster image heavily dimmed) is fine.
- Fonts / CLS: self-host the fonts used above the fold as woff2 in `public/fonts/` (Syne, Inter, JetBrains Mono; 2-3 weights each max; latin subset). You may download them once from the Google Fonts / Fontsource CDNs with a script you run locally (all three are OFL). `@font-face` with `font-display: swap` plus metric-matched fallbacks (`size-adjust`, `ascent-override`) so the swap does not shift layout; `<link rel="preload" as="font" crossorigin>` for the 2 hero weights. Use the same self-hosted fonts on home (remove the Google Fonts `<link>` from `index.html` and the subpages). If downloading fonts fails, keep Google Fonts but add `&display=swap`, preconnect, and metric-matched fallback `@font-face` rules; note it in the commit body.
- Keep each subpage's copy, JSON-LD, meta, canonical and OG tags exactly as they are (content-wise).

## Files
- `public/work/evolve/index.html`, `public/jarvis/index.html`, `public/kin/index.html`, `public/styles/page.css`, `public/fonts/*.woff2` (new), `index.html`, `src/index.css`, `src/components/ScrollSections.tsx` (footer only if it needs the shared structure), `scripts/stamp-assets.mjs` only if new assets must be stamped.

## Non-goals
- No copy changes. No new pages. No 404 yet (009). Do not change URLs.

## Verification
- `npm run build` passes.
- `node build-plan/verify/verify.mjs --checks <all previous>,subpage-cls --lighthouse` passes (`subpage-cls`: CLS < 0.1 on all three subpages at 390x844 after load + 3 s; header and footer present on every page).
- Compare home vs subpage screenshots at 390 and 1440: same header, footer, fonts and tokens.

## Commit message
```
feat(subpages): shared tokens, header, footer and self-hosted fonts across all pages (007)
```
