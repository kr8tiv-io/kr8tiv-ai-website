export interface HudDataPoint {
  label: string
  value: string
  unit?: string
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
  cta?: { text: string; href: string }
}

export const sections: Section[] = [
  {
    angle: 0,
    phi: Math.PI / 2.3,
    radius: 5.5,
    targetY: 0.2,
    label: 'Signal Processing',
    title: 'Read the market\nin real time',
    copy: 'Fifteen proprietary strategies scan every token across the Solana ecosystem. Pattern recognition, momentum analysis, and order flow — processed in milliseconds.',
    hudData: [
      { label: 'STRATEGIES', value: '15', unit: 'ACTIVE' },
      { label: 'SCAN RATE', value: '0.3', unit: 'MS' },
      { label: 'TOKENS', value: '2,847', unit: 'TRACKED' },
      { label: 'ACCURACY', value: '94.2', unit: '%' },
    ],
    hudColor: '#00e5ff',
    alignment: 'left',
  },
  {
    angle: Math.PI / 2,
    phi: Math.PI / 2.5,
    radius: 4.5,
    targetY: 0,
    label: 'Risk Management',
    title: 'Precision\nrisk control',
    copy: 'Multi-layered safety mesh with RugCheck, GoPlus, and Birdeye integration. Every trade filtered through comprehensive on-chain risk assessment before execution.',
    hudData: [
      { label: 'RISK LAYERS', value: '7', unit: 'ACTIVE' },
      { label: 'RUG BLOCKED', value: '312', unit: 'TODAY' },
      { label: 'MAX DRAW', value: '2.1', unit: '%' },
      { label: 'WIN RATE', value: '78.4', unit: '%' },
    ],
    hudColor: '#ff6b35',
    alignment: 'right',
  },
  {
    angle: Math.PI,
    phi: Math.PI / 3,
    radius: 5,
    targetY: 0.3,
    label: 'Intelligence',
    title: 'Clarity through\ncomplexity',
    copy: 'While others react, JARVIS anticipates. Machine learning models trained on millions of on-chain events surface alpha before it appears on any screen.',
    hudData: [
      { label: 'ML MODELS', value: '4', unit: 'RUNNING' },
      { label: 'DATA POINTS', value: '1.2M', unit: '/HR' },
      { label: 'ALPHA LEADS', value: '23', unit: 'ACTIVE' },
      { label: 'LATENCY', value: '47', unit: 'MS' },
    ],
    hudColor: '#a855f7',
    alignment: 'left',
  },
  {
    angle: (3 * Math.PI) / 2,
    phi: Math.PI / 2.2,
    radius: 4.8,
    targetY: 0.1,
    label: 'kr8tiv AI',
    title: 'The future\nis autonomous',
    copy: 'Built by kr8tiv AI. An autonomous trading intelligence that never sleeps, never panics, and never stops learning. This is the next generation.',
    hudData: [
      { label: 'UPTIME', value: '99.97', unit: '%' },
      { label: 'TRADES', value: '8,412', unit: 'EXECUTED' },
      { label: 'VERSION', value: '4.6', unit: 'OPUS' },
      { label: 'NETWORK', value: 'SOL', unit: 'MAINNET' },
    ],
    hudColor: '#d4a853',
    alignment: 'right',
    cta: { text: 'Join the waitlist', href: 'https://kr8tiv.ai' },
  },
]
