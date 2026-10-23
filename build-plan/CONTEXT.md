# kr8tiv.ai improvement pass: shared context for every prompt

Read this file first. Every prompt in `build-plan/prompts/` assumes it.

## The project
- Repo: kr8tiv-io/kr8tiv-ai-website, local working copy `C:\Users\lucid\Desktop\kr8tiv-ai-wt`, branch `improve-2026-10` (started from master @ 9a46644, which builds byte-identical to the live kr8tiv.ai).
- Stack: Vite 7 + React 19 + TypeScript + Tailwind v4, GSAP/ScrollTrigger, Lenis, three.js + @react-three/fiber + drei. `npm run build` = `tsc -b && vite build && node scripts/stamp-assets.mjs`.
- Home is the React SPA (`index.html`, `src/`). `/work/evolve/`, `/jarvis/`, `/kin/` are hand-written static HTML in `public/` sharing `public/styles/page.css`. Links between pages are RELATIVE (they must keep working at the site root and under a subpath preview). From React use PAGE_EVOLVE / PAGE_JARVIS / PAGE_KIN from `src/config/sections.ts`.
- Deploy target is Hostinger (static files in public_html, Apache `.htaccess`). The output must stay a plain static build.

## Reference material (read-only, outside the repo)
- Audit: `C:\Users\lucid\Desktop\kr8-ref\report.md`
- Spec: `C:\Users\lucid\Desktop\kr8-ref\grok-build-brief.md` (IDs like M1, S1, P2-3 refer to this file)
- Screenshots of the CURRENT live site: `C:\Users\lucid\Desktop\kr8-ref\shots\` (and `shots\frames\`)

## Hard rules (every prompt)
1. Never `git push`, never touch remotes, never switch to or modify `master`/`main`. Work only on the current branch. No `--no-verify`, no `--force`, no history rewriting.
2. Never run `ftp_deploy.py`, `firebase deploy`, or anything that talks to Hostinger, DNS, FTP, or the live site. Never print or commit secrets/tokens.
3. Never invent business facts: no new clients, stats, prices, testimonials, team members, dates, or claims. If copy needs a fact you do not have, keep the current text or leave a visible-in-code comment `TODO(Matt): ...` (in HTML use `<!-- TODO(Matt): ... -->`). Do not put "TODO" text on the rendered page.
4. Crypto is out of scope. Do not add, change or discuss crypto anything. Do not touch the GitHub link or GitHub org.
5. Do not remove JARVIS or KIN product content. If something about them looks wrong, leave it and add a `TODO(Matt)` comment.
6. Do not edit anything under `build-plan/` except where a prompt explicitly says so (never `build-plan/verify/`, `build-plan/driver/`, `build-plan/prompts/`).
7. Keep brand: `#050510` base, gold `#d4a853` as the only accent, white type, Syne / Inter / JetBrains Mono, headline "Your back office, automated.", phone 780-915-5471, hello@kr8tiv.ai, URLs `/`, `/work/evolve/`, `/jarvis/`, `/kin/`, JSON-LD and meta.
8. No new third-party trackers, widgets, CDNs or paid services. New npm deps only if a prompt allows it.
9. Use PowerShell syntax in the terminal (no `&&`; use `;`). Stop any dev/preview server you start before you finish.
10. Finish by committing with the exact message in the prompt's "Commit message" section, leaving the working tree clean.

## Shared contracts the verifier checks (keep them working once they exist)
- Site header: every page (home, /work/evolve/, /jarvis/, /kin/, and later 404) has exactly one `<header data-site-header>` at the top, height <= 64px at 390px wide.
- Below 1024px wide the header shows a `<button data-nav-toggle aria-expanded aria-controls>` (>= 44x44px). Clicking it opens `[data-nav-menu]`, which shows visible links to Home, Case study (`work/evolve/`), JARVIS (`jarvis/`), KIN (`kin/`), the phone (`tel:`) and email (`mailto:`). Escape and the button close it. At >= 1024px the Case study / JARVIS / KIN links are visible in the header without opening anything.
- No horizontal overflow at 390x844, 768x1024, 1440x900 on any page (`scrollWidth <= innerWidth`).
- Zero console errors, zero uncaught page errors, zero failed requests / 4xx / 5xx on all pages.

## Verifier
`node build-plan/verify/verify.mjs --checks <list>` builds nothing itself; the driver runs `npm run build` first, then this script against `vite preview`. You may run it yourself to self-check (run `npm run build` first). It writes screenshots to `C:\Users\lucid\Desktop\kr8tiv-ai-runs\`.
