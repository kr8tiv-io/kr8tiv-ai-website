---
id: "010"
title: Final review and checkpoint
kind: checkpoint
effort: xhigh
model: grok-4.7-build-fast
depends_on: []
checks: []
lighthouse: true
---
# 010: Final review / checkpoint

Read `build-plan/CONTEXT.md` first, then `build-plan/INDEX.md` and `build-plan/run.log` (which prompts are DONE, BLOCKED or SKIPPED).

## Goal
Make the branch coherent and reviewable for Matt: fix regressions introduced by earlier prompts, run every check, and write the review notes. Do not start new features.

## Must haves
- Run `npm run build` and `node build-plan/verify/verify.mjs --checks <every check from DONE prompts> --lighthouse`. Fix any failing check or regression with the smallest change. Do not attempt the work of a BLOCKED prompt beyond a minimal fix that a failing check needs.
- Walk the screenshots in `C:\Users\lucid\Desktop\kr8tiv-ai-runs\` at 390, 768 and 1440 for every page; fix obvious visual breakage (overlaps, clipped text, broken menu, misaligned header).
- Crypto scan: `dist/` must not contain `crypto|defi|solana|bags.fm|$BRAIN|nft|web3` in visible copy (ignore minified library code and the word `crypto` inside third-party JS like `crypto.getRandomValues`). Report, do not "fix" by removing product content.
- Clean up: no leftover debug code, unused imports, dead components (e.g. remove unused files only if nothing imports them), `npm run build` with no new TypeScript errors.
- Write `build-plan/REVIEW.md`: what changed per prompt (DONE/BLOCKED/SKIPPED, commit SHA), the verifier results, Lighthouse mobile numbers for home and /work/evolve/, known issues, and a "Needs Matt" section listing every `TODO(Matt)` from `git grep -n "TODO(Matt)"` with file:line and the question. (This prompt may write `build-plan/REVIEW.md`; nothing else under build-plan/.)

## Files
- Any source file needed for regression fixes; `build-plan/REVIEW.md` (new).

## Non-goals
- No new features, no copy changes, no push, no deploy.

## Verification
- `npm run build` passes.
- `node build-plan/verify/verify.mjs --checks <all from DONE prompts> --lighthouse` passes.

## Commit message
```
chore(review): final pass, regression fixes and REVIEW.md (010)
```
