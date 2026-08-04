# kr8tiv AI

**The official website for [kr8tiv AI](https://kr8tiv.ai)** — a professional AI automation company. We build AI back-office and operational systems for businesses.

> **Note:** kr8tiv AI is an artificial intelligence and software company. We are not affiliated with any marketing or creative agencies that may share a similar name. We build AI.

---

## About kr8tiv AI

kr8tiv AI builds the operational layer businesses actually run on: receipts that file themselves, quoting engines with profitability checks, dispatch tracking from lead to invoice, morning digests, and watchdog agents that catch dropped balls. The agents are wired into the tools a client already uses — spreadsheets, drive, email, calendar — so there is no migration and no retraining.

**How we engage:**

| Stage | What it is |
|-------|------------|
| AI Ops Audit | One week inside the operation; deliverable is a written automation plan the client keeps either way. |
| Back-Office Build | Fixed-scope build of the agents and pipelines, on the client's existing stack. |
| Care | Ongoing tuning and new automations, month to month, no lock-in. |

The source code for everything we build for a client is handed over to that client, and their data stays in their own accounts.

**Case study:** [Evolve Eco Blasting](https://kr8tiv.ai/work/evolve/) — Edmonton industrial surface restoration. One crew, zero office staff, a complete AI operations layer running on the spreadsheets and drive they already owned.

## Products

- **JARVIS** — the context engine behind every build: one place that holds what a business knows, so each agent acts on current facts instead of guessing. [/jarvis/](https://kr8tiv.ai/jarvis/)
- **KIN** — the AI front desk: a bespoke assistant on voice, Telegram, and WhatsApp, configured end to end for non-technical staff. [/kin/](https://kr8tiv.ai/kin/)

## Tech Stack

- **React 19** + TypeScript
- **Three.js** via React Three Fiber (R3F) for 3D rendering
- **GSAP** with ScrollTrigger for scroll-driven animations
- **Lenis** for smooth scrolling
- **Tailwind CSS v4** for styling
- **Vite** for builds
- **Firebase Hosting** for deployment

### Site structure

- `/` — single-page 3D scroll experience (React + R3F). The centerpiece is the **OpsMachine**: a procedural robotic arm that sorts a chaos-pile of paperwork into a lit grid as you scroll.
- `/work/evolve/`, `/jarvis/`, `/kin/` — static HTML sub-pages in `public/`. No JavaScript, no 3D: fast, crawlable, and unaffected by the SPA build.

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Cross-browser visual checks (Chromium / Firefox / Edge)
npm run test:visual
```

## Branches

| Branch | Description |
|--------|-------------|
| `master` | Live production branch |
| `preview-automation-upgrade` | Staged automation-repositioning upgrade (preview only) |
| `gh-pages` | Built preview hosted at [kr8tiv-io.github.io/kr8tiv-ai-website](https://kr8tiv-io.github.io/kr8tiv-ai-website/) |

## Links

- **Website:** [kr8tiv.ai](https://kr8tiv.ai)
- **GitHub:** [github.com/kr8tiv-io](https://github.com/kr8tiv-io)
- **Design studio (sister brand):** [kr8tiv.io](https://kr8tiv.io)
- **Contact:** hello@kr8tiv.ai · 780-915-5471

---

Built by kr8tiv AI — Edmonton, Alberta.
