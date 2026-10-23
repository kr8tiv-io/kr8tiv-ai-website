---
id: "001"
title: Mobile and tablet navigation on all four pages
kind: build
effort: xhigh
model: grok-4.7-build-fast
depends_on: []
checks: [nav]
lighthouse: false
---
# 001: Mobile and tablet navigation (brief M1, audit P1-2)

Read `build-plan/CONTEXT.md` first. It has the hard rules and the header contract the verifier checks.

## Goal
Below 1024px the home page has no page navigation at all (`NavigationBar.tsx` hides Case study / JARVIS / KIN with `hidden lg:flex`, no menu button), and the static subpages have a different header that wraps to 3 rows on phones. Give all four pages one compact header with a working menu on phones and tablets.

## Must haves
- Home (`src/components/NavigationBar.tsx`): replace the floating top-right cluster with a full-width `<header data-site-header>` (fixed or sticky, one line, height <= 64px at 390). Left: a legible text wordmark "kr8tiv AI" linking to the home top. Right: "Book audit" (existing `AUDIT_MAILTO`) and, below 1024px, a `<button data-nav-toggle aria-expanded aria-controls="site-menu" aria-label="Menu">` at least 44x44px.
- The menu (`<nav id="site-menu" data-nav-menu>`) lists Home, Case study, JARVIS, KIN (use PAGE_EVOLVE / PAGE_JARVIS / PAGE_KIN), the phone (PHONE_HREF / PHONE_DISPLAY) and email (hello@kr8tiv.ai, same mailto as today). Opening: button click. Closing: button, Escape, a link click, and a click outside. Focus moves into the menu on open and back to the button on close. It must sit above the 3D canvas and above every other overlay (VibesButton, TransitionFlash, the HUD panels) and must not be hidden by the intro/loading curtain once it has finished.
- At >= 1024px, Case study / JARVIS / KIN and the phone show inline in the header (no toggle). Keep the existing social icons only where they fit without crowding; on phones they can move into the menu. Do not remove any social link and do not change any link target.
- Subpages (`public/work/evolve/index.html`, `public/jarvis/index.html`, `public/kin/index.html`): replace the `<header class="topbar">` block with the SAME markup structure and data attributes (static HTML, relative links, e.g. `../` and `../../`), styled in `public/styles/page.css`. The menu must work with a tiny inline `<script>` (no framework, no external file is fine either way; keep it < 1.5 KB) and must still be usable without JS (e.g. links visible in a `<noscript>` or the menu degrades to visible links). One line at 390px, height <= 64px.
- Hit areas: every header link/button >= 44px tall at < 1024px. Visible focus styles. Text >= 14px for nav items and buttons.
- `aria-current="page"` on the current page link.

## Files
- `src/components/NavigationBar.tsx` (main work), `src/App.tsx` only if mounting order/z-index must change, `src/index.css` for shared styles if needed.
- `public/work/evolve/index.html`, `public/jarvis/index.html`, `public/kin/index.html`, `public/styles/page.css`.

## Non-goals
- No redesign of sections, footer or 3D (later prompts). No copy changes beyond the nav labels. Do not remove VibesButton yet (prompt 008).
- No new npm dependencies.

## Verification
- `npm run build` passes.
- `node build-plan/verify/verify.mjs --checks nav` passes: at 390x844, 768x1024, 1440x900 on all four pages: header present and <= 64px tall at 390, toggle visible below 1024 and opens a menu with visible links to evolve/jarvis/kin/tel/mailto, inline links visible at 1440, no horizontal overflow, no console errors, no failed requests.
- Look at the screenshots in `C:\Users\lucid\Desktop\kr8tiv-ai-runs\` and confirm the header is one clean line on phones.

## Commit message
```
feat(nav): one-line site header with mobile/tablet menu on all pages (001)
```
