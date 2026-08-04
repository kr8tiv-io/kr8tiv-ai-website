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

export const PHONE_DISPLAY = '780-915-5471'
export const PHONE_HREF = 'tel:+17809155471'
export const AUDIT_MAILTO =
  'mailto:hello@kr8tiv.ai?subject=AI%20Ops%20Audit&body=Tell%20us%20what%20eats%20your%20week%20%E2%80%94%20we%27ll%20tell%20you%20what%20an%20agent%20could%20take%20off%20your%20plate.'

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
      { text: 'Book an AI Ops Audit →', href: AUDIT_MAILTO },
      { text: `Call ${PHONE_DISPLAY} →`, href: PHONE_HREF },
      { text: 'The design side: kr8tiv.io →', href: 'https://kr8tiv.io/work/' },
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
    copy: "We don't sell you a platform and a migration. Your business already runs on something — spreadsheets, a drive, email, a calendar. We leave all of it exactly where it is and wire AI agents in underneath: MCP-native connectors that read, write, and reconcile across the tools you already trust. If we disappeared tomorrow, you'd still own everything — the data, the documents, and the code, because every line of it is public.",
    hudData: [
      { label: 'YOUR STACK', value: 'KEPT' },
      { label: 'MIGRATION', value: 'NONE' },
      { label: 'AGENTS', value: 'MCP', unit: 'NATIVE' },
      { label: 'CODE', value: 'OPEN' },
      { label: 'LOCK-IN', value: 'ZERO' },
    ],
    hudColor: '#ffffff',
    alignment: 'left',
    cta: { text: 'Read the code →', href: 'https://github.com/kr8tiv-ai' },
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
    copy: "Two products power every back-office we ship. JARVIS is the context engine — an autonomous system that knows your business, watches your numbers, and gets smarter every week; it started as a live trading terminal on Solana and is growing into a portable intelligence layer for everything else. KIN is the concierge — a bespoke AI companion on voice, Telegram, and WhatsApp, configured end-to-end so the least technical person on your crew can use frontier AI without touching a setting.",
    hudData: [
      { label: 'JARVIS', value: 'CONTEXT', unit: 'ENGINE' },
      { label: 'KIN', value: 'CONCIERGE', unit: 'AI' },
      { label: 'STATUS', value: 'LIVE' },
      { label: 'SOURCE', value: 'PUBLIC' },
    ],
    hudColor: '#ffffff',
    alignment: 'right',
    ctas: [
      { text: 'JARVIS Dashboard →', href: 'https://jarvislife.io/' },
      { text: 'Meet Your KIN →', href: 'https://meetyourkin.com' },
      { text: 'GitHub →', href: 'https://github.com/Matt-Aurora-Ventures/Jarvis' },
    ],
  },
  {
    angle: Math.PI * 1.62,
    phi: Math.PI / 2.6,
    radius: 7.6,
    targetY: 0.25,
    sysCode: 'TKN',
    density: 'standard',
    label: 'Open Source · Tokenized',
    title: 'Read the code that\nruns your business.',
    copy: "Most AI companies ask you to trust a black box. We publish everything — every agent, every pipeline, every line. And because kr8tiv AI is tokenized, the people who use what we build own a piece of it: 75% of revenue flows to $KR8TIV holders, 5% to charity, and the rest keeps the lights on. You're not renting software from a landlord. You're holding equity in the thing that does your paperwork.",
    hudData: [
      { label: 'REVENUE TO HOLDERS', value: '75', unit: '%' },
      { label: 'TO CHARITY', value: '5', unit: '%' },
      { label: 'REPOS', value: 'PUBLIC' },
      { label: 'BLACK BOXES', value: '0' },
      { label: 'VIBES', value: 'IMPECCABLE' },
    ],
    hudColor: '#ffffff',
    alignment: 'left',
    ctas: [
      { text: '$KR8TIV on Bags →', href: 'https://bags.fm/U1zc8QpnrQ3HBJUBrWFYWbQTLzNsCpPgZNegWXdBAGS' },
      { text: '@kr8tivAI on X →', href: 'https://x.com/kr8tivai' },
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
    copy: "We're not consultants who discovered AI last quarter. We've been the founder drowning in receipts at midnight, the one-person office chasing invoices between jobs. That's why everything we build starts from the same question: what would give this person their evenings back? We ship fast, in public, and fix our mistakes where everyone can see. The best companies of the next decade won't look like software vendors — they'll look like a crew you trust with the keys. That's the whole pitch.",
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
