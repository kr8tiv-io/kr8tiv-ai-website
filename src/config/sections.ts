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
    radius: 7.5,
    targetY: 0.2,
    label: 'Autonomous Intelligence',
    title: 'Software that\nthinks forward',
    copy: 'kr8tiv AI builds production-grade autonomous systems across industries — from trading algorithms to context engines to quantum-ready architectures. Every product ships with intelligence at its core.',
    hudData: [
      { label: 'ACTIVE SYSTEMS', value: '12', unit: 'DEPLOYED' },
      { label: 'DECISIONS', value: '4.2M', unit: '/DAY' },
      { label: 'INDUSTRIES', value: '7', unit: 'SECTORS' },
      { label: 'UPTIME', value: '99.97', unit: '%' },
    ],
    hudColor: '#00e5ff',
    alignment: 'left',
  },
  {
    angle: Math.PI / 2,
    phi: Math.PI / 2.5,
    radius: 7,
    targetY: 0,
    label: 'Open Source · Tokenized',
    title: 'Built in public.\nOwned by everyone.',
    copy: 'Every line of code is open source. Every dollar of revenue flows back to $KR8TIV holders. This isn\'t a company that extracts — it\'s an ecosystem that compounds. The more we build, the more you earn.',
    hudData: [
      { label: 'REPOS', value: '24', unit: 'PUBLIC' },
      { label: 'REVENUE SHARE', value: '80', unit: '%' },
      { label: 'HOLDERS', value: '3,847', unit: 'ACTIVE' },
      { label: 'COMMITS', value: '12.4K', unit: 'YTD' },
    ],
    hudColor: '#a855f7',
    alignment: 'right',
  },
  {
    angle: Math.PI,
    phi: Math.PI / 3,
    radius: 7.5,
    targetY: 0.3,
    label: 'Multi-Industry AI',
    title: 'Every industry.\nOne intelligence.',
    copy: 'Trading. Architecture. Manufacturing. Residential. Quantum computing. We don\'t build tools — we build the intelligence layer that sits beneath entire industries and makes them autonomous.',
    hudData: [
      { label: 'TRADING', value: 'LIVE', unit: '' },
      { label: 'CONTEXT MGT', value: 'LIVE', unit: '' },
      { label: 'QUANTUM', value: 'R&D', unit: '' },
      { label: 'RESIDENTIAL', value: '2026', unit: 'Q4' },
    ],
    hudColor: '#ff6b35',
    alignment: 'left',
  },
  {
    angle: (3 * Math.PI) / 2,
    phi: Math.PI / 2.2,
    radius: 7,
    targetY: 0.1,
    label: 'The Vision',
    title: 'Intelligence\nwithout limits',
    copy: 'We\'re building the infrastructure for a world where AI doesn\'t assist — it architects. Prediction models, quantum optimization, and autonomous systems that scale across every domain humanity touches.',
    hudData: [
      { label: 'AI MODELS', value: '8', unit: 'ACTIVE' },
      { label: 'PARAMETERS', value: '4.6B', unit: 'TRAINED' },
      { label: 'LATENCY', value: '< 50', unit: 'MS' },
      { label: 'NETWORK', value: 'MULTI', unit: 'CHAIN' },
    ],
    hudColor: '#d4a853',
    alignment: 'right',
    cta: { text: 'Enter the ecosystem', href: 'https://kr8tiv.ai' },
  },
]
