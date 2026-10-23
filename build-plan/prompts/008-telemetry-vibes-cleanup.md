---
id: "008"
title: Remove fake status cards and live clock; make the music button optional
kind: build
effort: xhigh
model: grok-4.7-build-fast
depends_on: []
checks: [no-telemetry]
lighthouse: false
---
# 008: Drop the fake telemetry and the floating VIBES button (brief section 5, M6; audit P3-1, P3-2, P3-4)

Read `build-plan/CONTEXT.md` first. Remember rule 3: never invent facts.

## Goal
Every home section carries a "SECTOR 0x / SYS.AUT / NOMINAL" HUD card with a live UTC clock (e.g. "19:43:43Z"), the footer says "All systems nominal", and a floating "VIBES" music button sits bottom-right on every screen, overlapping content on phones. Remove the fake telemetry and the floating control without inventing anything to replace them.

## Must haves
- HUD cards (`src/components/ui/HudPanel.tsx`, `src/config/sections.ts`, `src/components/ScrollSections.tsx`, `src/components/HeroOverlay.tsx`, `src/experience/HudRing.tsx` if it renders text): remove sector codes, "SYS.*" labels, "NOMINAL"/"ONLINE"-style status words, fake IDs, and the live clock. Where a section has real numbers or facts ALREADY in the copy (receipts photo -> ledger, same-day quotes, 6:30 AM digest, 24/7 watchdogs, etc.), you may show them as one plain stats row using exactly the existing wording. Do not add new numbers.
- Joke lines ("TEAM: SMALL & LOUD", "EGO: MANAGED (MOSTLY)", "CORPORATE JARGON: BANNED"): if they live in a telemetry card being removed, keep the text out of the UI but preserve it in a code comment `TODO(Matt): keep these lines? ...` next to the section data. Do not rewrite them.
- Footer: replace "© 2026 kr8tiv AI — All systems nominal" with "© 2026 kr8tiv AI". Rename the "Twitter" label to "X" (target unchanged).
- Music (M6): remove the floating `VibesButton` from every viewport. Keep music OPTIONAL: a small, plainly labelled text button in the footer ("Play music" / "Pause music", >= 44px target, aria-pressed) that lazy-creates the audio only on click (no download before click). Add `TODO(Matt): keep background music at all? If not, delete VibesButton + public/vibes.mp3.` next to it.
- Brand casing: use "kr8tiv AI" in visible text where the home uses "KR8TIV AI" in sentence/body contexts. Leave uppercase-styled labels styled with CSS `text-transform` alone. Leave the hero line "KR8TIV AI · EDMONTON → EVERYWHERE" content as is (case can be via CSS).
- Claims the audit could not verify ("Running in production today", "In production · Live client systems", "Same day (was three evenings)", "6:30 AM", "We've been the founder drowning in receipts..."): keep the text; add one `TODO(Matt): confirm claim` comment beside each in source (home and subpages).
- The "Fill the intake →" link to kr8tiv.io/start/: keep it; add `TODO(Matt): intake on kr8tiv.ai, a calendar link, or keep kr8tiv.io?`. The GitHub icon: keep; add `TODO(Matt): GitHub org profile has off-message content (see audit P2-8); keep link?`. Telegram: keep; add `TODO(Matt): keep Telegram?`.

## Files
- `src/components/ui/HudPanel.tsx`, `src/components/ScrollSections.tsx`, `src/components/HeroOverlay.tsx`, `src/components/VibesButton.tsx`, `src/App.tsx`, `src/config/sections.ts`, `src/experience/HudRing.tsx`, subpage HTML only for TODO comments / "Twitter" label.

## Non-goals
- No new copy, stats or claims. No removal of JARVIS/KIN content. No crypto/GitHub changes beyond the TODO comment.

## Verification
- `npm run build` passes.
- `node build-plan/verify/verify.mjs --checks <all previous>,no-telemetry` passes (`no-telemetry`: no visible text matching a clock `\d\d:\d\d:\d\dZ`, "NOMINAL", "SYS.", "SECTOR 0"; no fixed/floating element containing "VIBES"; the footer music control, if kept, does not request `vibes.mp3` before click).
- `git grep -n "TODO(Matt)"` lists the new TODOs (paste the list in the commit body).

## Commit message
```
chore(content): remove fake telemetry and clock, footer-only optional music (008)
```
