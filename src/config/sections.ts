export interface HudDataPoint {
  label: string
  value: string
  unit?: string
}

export interface SectionCta {
  text: string
  href: string
}

export interface Section {
  angle: number
  phi: number
  radius: number
  targetY: number
  sysCode: string
  density: 'compact' | 'standard' | 'dense'
  label: string
  title: string
  copy: string
  hudData: HudDataPoint[]
  hudColor: string
  alignment: 'left' | 'right'
  cta?: SectionCta
  ctas?: SectionCta[]
}

import { asset } from '../lib/asset'

export const PHONE_DISPLAY = '780-915-5471'
export const PHONE_HREF = 'tel:+17809155471'
export const AUDIT_MAILTO =
  'mailto:hello@kr8tiv.ai?subject=AI%20Ops%20Audit&body=Tell%20us%20what%20eats%20your%20week%20%E2%80%94%20we%27ll%20tell%20you%20what%20an%20agent%20could%20take%20off%20your%20plate.'

/** Static sub-pages (real HTML, base-URL aware so subpath previews work). */
export const PAGE_EVOLVE = asset('/work/evolve/')
export const PAGE_JARVIS = asset('/jarvis/')
export const PAGE_KIN = asset('/kin/')

export const sections: Section[] = [
  {
    angle: Math.PI / 2.1,
    phi: Math.PI / 2.35,
    radius: 6.8,
    targetY: 0.25,
    sysCode: 'AUT',
    density: 'dense',
    label: 'What We Automate',
    title: 'The paperwork\ndoes itself now.',
    copy: "Every small business runs on the same invisible grind: receipts photographed and forgotten, quotes that take three evenings, invoices nobody chased, a schedule living in someone's head. We build AI back-offices that take that work outright. A receipt photo becomes a logged, filed expense. A job walk becomes a priced quote checked against your real margins. Every morning at 6:30 a digest lands with today's jobs, overdue follow-ups, and the money you're about to leave on the table. Your part is a photo and a yes.",
    hudData: [
      { label: 'RECEIPTS', value: 'PHOTO', unit: '→ LEDGER' },
      { label: 'QUOTES', value: 'SAME', unit: 'DAY' },
      { label: 'MORNING DIGEST', value: '6:30', unit: 'AM' },
      { label: 'WATCHDOG AGENTS', value: '24/7' },
      { label: 'YOUR PART', value: 'A PHOTO' },
    ],
    hudColor: '#ffffff',
    alignment: 'left',
  },
  {
    angle: Math.PI * 0.92,
    phi: Math.PI / 2.5,
    radius: 6.4,
    targetY: 0.2,
    sysCode: 'EVO',
    density: 'dense',
    label: 'Case Study · Evolve Eco Blasting',
    title: 'One crew.\nZero back office.',
    copy: "Evolve is an industrial surface-restoration company in Edmonton — one crew, real equipment, no office staff. We built their entire operations layer: receipts photographed in the field file themselves into the books; quotes generate against a live rate table with a profitability check so no job is priced below break-even; dispatch tracks every job from lead to invoice; watchdog agents raise a flag when a deposit lands unscheduled or an invoice sits unpaid; and each morning a digest arrives before the crew does. Nothing was replaced — the whole system runs on the spreadsheets and drive they already owned, with AI agents wired in underneath.",
    hudData: [
      { label: 'OFFICE STAFF', value: '0' },
      { label: 'TOOLS REPLACED', value: 'NONE' },
      { label: 'RECEIPT FILING', value: 'AUTO' },
      { label: 'BALL-DROPS', value: 'CAUGHT', unit: 'BY AGENT' },
      { label: 'STACK', value: 'THEIRS', unit: '+ AI' },
    ],
    hudColor: '#ffffff',
    alignment: 'right',
    ctas: [
      { text: 'Read the full case study →', href: PAGE_EVOLVE },
      { text: 'Book an AI Ops Audit →', href: AUDIT_MAILTO },
      { text: `Call ${PHONE_DISPLAY} →`, href: PHONE_HREF },
    ],
  },
  {
    angle: Math.PI * 1.18,
    phi: Math.PI / 3.1,
    radius: 7.2,
    targetY: 0.15,
    sysCode: 'SYS',
    density: 'standard',
    label: 'How It Works',
    title: 'Your tools.\nOur agents.',
    copy: "We don't sell you a platform and a migration. Your business already runs on something — spreadsheets, a drive, email, a calendar. We leave all of it exactly where it is and wire AI agents in underneath: MCP-native connectors that read, write, and reconcile across the tools you already trust. Nothing is retyped, nothing is re-platformed, and your team keeps working in the software they already know.",
    hudData: [
      { label: 'YOUR STACK', value: 'KEPT' },
      { label: 'MIGRATION', value: 'NONE' },
      { label: 'AGENTS', value: 'MCP', unit: 'NATIVE' },
      { label: 'RETRAINING', value: 'NONE' },
      { label: 'LOCK-IN', value: 'ZERO' },
    ],
    hudColor: '#ffffff',
    alignment: 'left',
    cta: { text: 'See it running at Evolve →', href: PAGE_EVOLVE },
  },
  {
    angle: Math.PI * 1.42,
    phi: Math.PI / 2.3,
    radius: 7,
    targetY: 0.2,
    sysCode: 'PRD',
    density: 'standard',
    label: 'The Engines',
    title: 'JARVIS thinks.\nKIN talks.',
    copy: "Two systems power every back-office we ship. JARVIS is the context engine — it holds everything your business knows in one place, watches the numbers between jobs, and hands each agent the context it needs to act correctly instead of guessing. KIN is the front desk — a bespoke AI assistant reachable on voice, Telegram, and WhatsApp, configured end to end so the least technical person on your crew can ask for a quote, a schedule, or a number and simply get it.",
    hudData: [
      { label: 'JARVIS', value: 'CONTEXT', unit: 'ENGINE' },
      { label: 'KIN', value: 'ASSISTANT', unit: 'VOICE + CHAT' },
      { label: 'STATUS', value: 'IN', unit: 'PRODUCTION' },
      { label: 'DEPLOYED ON', value: 'YOUR', unit: 'STACK' },
    ],
    hudColor: '#ffffff',
    alignment: 'right',
    ctas: [
      { text: 'JARVIS — the context engine →', href: PAGE_JARVIS },
      { text: 'KIN — the AI front desk →', href: PAGE_KIN },
    ],
  },
  {
    angle: Math.PI * 1.62,
    phi: Math.PI / 2.6,
    radius: 7.6,
    targetY: 0.25,
    sysCode: 'OWN',
    density: 'standard',
    label: 'What You Own',
    title: 'It stays yours\nwhen we leave.',
    copy: "Most AI vendors rent you a black box and keep the keys. We hand over the whole thing: the source code for every agent we write for you, the documentation to run it, and the accounts it runs in — which were yours to begin with. Fixed-scope engagements, a written plan before anyone touches a keyboard, and a support agreement you can end any month. If you ever want to bring it in-house or hand it to another firm, there is nothing to unwind.",
    hudData: [
      { label: 'SOURCE CODE', value: 'HANDED', unit: 'OVER' },
      { label: 'YOUR DATA', value: 'YOUR', unit: 'ACCOUNTS' },
      { label: 'BLACK BOXES', value: '0' },
      { label: 'CONTRACT', value: 'MONTH', unit: 'TO MONTH' },
      { label: 'EXIT COST', value: 'NONE' },
    ],
    hudColor: '#ffffff',
    alignment: 'left',
    ctas: [
      { text: 'Book an AI Ops Audit →', href: AUDIT_MAILTO },
      { text: `Call ${PHONE_DISPLAY} →`, href: PHONE_HREF },
    ],
  },
  {
    angle: (5 * Math.PI) / 3,
    phi: Math.PI / 3,
    radius: 10.5,
    targetY: 0.2,
    sysCode: 'HMN',
    density: 'dense',
    label: 'The Human Part',
    title: "Built by people who\nran the businesses.",
    copy: "We're not consultants who discovered AI last quarter. We've been the founder drowning in receipts at midnight, the one-person office chasing invoices between jobs. That's why everything we build starts from the same question: what would give this person their evenings back? We ship fast, we show our work, and we fix our mistakes in front of you. The best companies of the next decade won't look like software vendors — they'll look like a crew you trust with the keys. That's the whole pitch.",
    hudData: [
      { label: 'TEAM', value: 'SMALL', unit: '& LOUD' },
      { label: 'CORPORATE JARGON', value: 'BANNED' },
      { label: 'EGO', value: 'MANAGED', unit: '(MOSTLY)' },
      { label: 'MISSION', value: 'ELIMINATE', unit: 'BUSYWORK' },
    ],
    hudColor: '#ffffff',
    alignment: 'right',
  },
]
