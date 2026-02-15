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
  label: string
  title: string
  copy: string
  hudData: HudDataPoint[]
  hudColor: string
  alignment: 'left' | 'right'
  cta?: SectionCta
  ctas?: SectionCta[]
}

export const sections: Section[] = [
  {
    angle: 0,
    phi: Math.PI / 2.3,
    radius: 7.5,
    targetY: 0.2,
    label: 'Who We Are',
    title: 'Anarcho\ncAIpitalist\nopen source',
    copy: "We\u2019re here because the singularity doesn\u2019t need another corporation extracting value from the people it\u2019s supposed to serve. kr8tiv AI builds autonomous systems across every industry we can get our hands on \u2014 trading, architecture, manufacturing, natural resources, marketing, robotics \u2014 and we give it all away. Open source. Tokenized. Built so that the people who use the product own the product. Because if AI is trained on your data, you should benefit from what it builds.",
    hudData: [
      { label: 'PHILOSOPHY', value: 'OPEN', unit: 'SOURCE' },
      { label: 'REVENUE TO HOLDERS', value: '75', unit: '%' },
      { label: 'TO CHARITY', value: '5', unit: '%' },
      { label: 'BLACK BOXES', value: '0' },
      { label: 'VIBES', value: 'IMPECCABLE' },
    ],
    hudColor: '#ffffff',
    alignment: 'left',
  },
  {
    angle: Math.PI / 2,
    phi: Math.PI / 2.5,
    radius: 7,
    targetY: 0,
    label: 'Open Source \u00B7 Tokenized',
    title: 'Your data trained it.\nYou should own it.',
    copy: "Here\u2019s the deal: AI companies are building billion-dollar products on your data and giving you nothing. We think that\u2019s insane. kr8tiv AI is fully open source and tokenized \u2014 $KR8TIV holders get 75% of revenue, 5% goes to charity, and the rest keeps the lights on. You\u2019re not a user. You\u2019re an owner. We\u2019re not extracting value from the future \u2014 we\u2019re distributing it.",
    hudData: [
      { label: 'REPOS', value: 'PUBLIC' },
      { label: 'REVENUE SHARE', value: '75%', unit: 'HOLDERS' },
      { label: 'CHARITY', value: '5', unit: '%' },
      { label: 'SOURCE', value: 'FULLY', unit: 'OPEN' },
      { label: 'TRUST MODEL', value: 'VERIFY', unit: 'ALL' },
    ],
    hudColor: '#ffffff',
    alignment: 'right',
  },
  {
    angle: Math.PI,
    phi: Math.PI / 3,
    radius: 7.5,
    targetY: 0.3,
    label: 'JARVIS',
    title: 'Not just a trading bot.\nA context engine.',
    copy: "JARVIS is our flagship \u2014 an AI trading terminal on Solana that processes signals, manages risk, and surfaces alpha in real time. But here\u2019s where it gets interesting: JARVIS is being built to become something much bigger. A portable context engine that knows you, upgrades itself, and puts autonomous intelligence in everyone\u2019s hands. Not in five years. Now. We\u2019re in the early stages and building fast. Come watch.",
    hudData: [
      { label: 'STATUS', value: 'LIVE', unit: 'SOLANA' },
      { label: 'STAGE', value: 'EARLY', unit: '& BUILDING' },
      { label: 'CONTEXT ENGINE', value: 'IN', unit: 'DEV' },
      { label: 'CODE', value: 'OPEN', unit: 'SOURCE' },
    ],
    hudColor: '#ffffff',
    alignment: 'left',
    ctas: [
      { text: 'JARVIS Dashboard \u2192', href: 'https://jarvislife.io/' },
      { text: 'GitHub Repo \u2192', href: 'https://github.com/Matt-Aurora-Ventures/Jarvis' },
      { text: '@kr8tivAI on X \u2192', href: 'https://x.com/kr8tivai' },
    ],
  },
  {
    angle: (3 * Math.PI) / 2,
    phi: Math.PI / 2.2,
    radius: 7,
    targetY: 0.1,
    label: 'Multi-Industry',
    title: "We\u2019re coming\nfor all of it.",
    copy: "The singularity doesn\u2019t care about your industry vertical. Neither do we. kr8tiv AI builds autonomous intelligence across markets, architecture, manufacturing, natural resources, marketing, engineering \u2014 whatever needs to get smarter. We\u2019re always looking to collaborate, always building in public, and always trying to make AI so approachable that the barrier to entry is basically zero. Got a sector that needs intelligence? Let\u2019s talk.",
    hudData: [
      { label: 'LIVE NOW', value: 'TRADING', unit: '\u00B7 CONTEXT' },
      { label: 'BUILDING', value: 'EVERYTHING', unit: 'ELSE' },
      { label: 'TIMELINE', value: 'ASAP' },
      { label: 'COLLABORATORS', value: 'WELCOME' },
    ],
    hudColor: '#ffffff',
    alignment: 'right',
  },
  {
    // CHANGED: Don't wrap all the way back to 0 (2π) — stop at ~5π/3
    // to avoid looking directly into the product's bright LED strip.
    // Pulled radius from 10→11 and raised phi for a higher vantage point.
    angle: (5 * Math.PI) / 3,
    phi: Math.PI / 3,
    radius: 11,
    targetY: 0.2,
    label: 'The Human Part',
    title: "We\u2019re just people\nwho think this\nshould be fun.",
    copy: "Here\u2019s what nobody tells you about the AI revolution: it should be fun. Not sterile. Not corporate. Not hidden behind NDAs and billion-dollar licensing fees. We\u2019re a small team that wakes up every day genuinely excited to build things that didn\u2019t exist yesterday. We make mistakes in public. We ship fast, break things, and fix them where everyone can see. We think the best companies in the next decade won\u2019t look like companies at all \u2014 they\u2019ll look like communities that build incredible products together and split the upside. That\u2019s kr8tiv. We\u2019re not trying to be the next trillion-dollar extraction machine. We\u2019re trying to build software that makes your life better, give you a piece of it, and have a stupidly good time doing it. If that sounds naive, give it a year.",
    hudData: [
      { label: 'TEAM', value: 'SMALL', unit: '& LOUD' },
      { label: 'EGO', value: 'MANAGED', unit: '(MOSTLY)' },
      { label: 'CORPORATE JARGON', value: 'BANNED' },
      { label: 'MISSION', value: 'ELIMINATE', unit: 'SCARCITY' },
    ],
    hudColor: '#ffffff',
    alignment: 'left',
  },
]
