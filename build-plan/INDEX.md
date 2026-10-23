# kr8tiv.ai improvement pass: build plan index

Branch `improve-2026-10` (from master @ 9a46644). Local only: never pushed. Driver: `build-plan/driver/run-kr8.ps1`
(Grok Build: `grok -m grok-4.7-build-fast --effort xhigh`, one fresh headless session per prompt). Shared rules: `build-plan/CONTEXT.md`.
Verifier: `build-plan/verify/verify.mjs`. Timeline: `build-plan/run.log`. State: `build-plan/state.json`.

| id | title | kind | depends_on | verifier checks added | lighthouse |
|---|---|---|---|---|---|
| 001 | Mobile and tablet navigation on all four pages | build | none | nav | no |
| 002 | 3D layout so content never sits under the model, plus a content scrim | build | none | scrim | no |
| 003 | Shader fixes: dither the bands, DPR/antialias, drop the glitch flicker | build | none | shader-src | no |
| (checkpoint after 003: build -> preview) | | | | | |
| 004 | Mobile perf tier (poster first, no HDR on phones) and reduced-motion fallback | build | none | poster-tier, reduced-motion | yes |
| 005 | Shorten the mobile scroll and remove empty stops | build | none | scroll-height | no |
| 006 | Type scale minimums and tap-target sizes | build | 001 | tiny-text, tap-targets | yes |
| (checkpoint after 006) | | | | | |
| 007 | Unify the subpage header, footer and design with home | build | 001 | subpage-cls | yes |
| 008 | Remove fake status cards and live clock; make the music button optional | build | none | no-telemetry | no |
| 009 | A real 404 (ErrorDocument plus a branded page) | build | 001 | 404 | no |
| (checkpoint after 009) | | | | | |
| 010 | Final review and checkpoint (REVIEW.md, TODO(Matt) list) | checkpoint | none | (all from DONE prompts) | yes |
| (final checkpoint) | | | | | |

Every prompt's verification = `npm run build` + `verify.mjs` with the union of checks from all DONE prompts plus its own.
Always-on checks at 390x844, 768x1024 and 1440x900 on `/`, `/work/evolve/`, `/jarvis/`, `/kin/`: no horizontal overflow,
no console/page errors, no failed requests or 4xx/5xx. `nav` (from 001 on): header + mobile menu contract in CONTEXT.md.

Failure policy: one retry in a fresh session with the failure list appended. If it still fails, the attempt is kept on
branch `blocked/NNN`, a revert commit restores `improve-2026-10`, the prompt is logged BLOCKED, and the run continues;
prompts whose `depends_on` includes a BLOCKED/SKIPPED prompt are SKIPPED.
