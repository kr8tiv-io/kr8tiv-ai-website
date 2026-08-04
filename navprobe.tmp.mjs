import { chromium } from '@playwright/test'
const BASE = (process.argv[2] || 'http://72.61.7.126:8093').replace(/\/$/, '')
const browser = await chromium.launch({ headless: true })
const vp = { width: 1440, height: 900 }
const ctx = await browser.newContext({ viewport: vp })
const page = await ctx.newPage()
page.on('framenavigated', (f) => { if (f === page.mainFrame()) console.log('  [framenavigated]', f.url()) })
await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(16000)

const total = await page.evaluate(() => document.body.scrollHeight)
for (let i = 0; i < 30; i++) { await page.mouse.wheel(0, (total - vp.height) / 30); await page.waitForTimeout(120) }
await page.waitForTimeout(2500)

const before = await page.evaluate(() => {
  const a = [...document.querySelectorAll('a')].filter((x) => x.textContent.trim() === 'Evolve case study').pop()
  const inner = a.closest('.section-inner')
  const sec = a.closest('section')
  return {
    href: a.href,
    innerOpacity: getComputedStyle(inner).opacity,
    innerTransform: getComputedStyle(inner).transform,
    secRect: JSON.stringify(sec.getBoundingClientRect()).slice(0, 120),
    scrollY: Math.round(scrollY),
    docH: document.body.scrollHeight,
  }
})
console.log('before click:', JSON.stringify(before, null, 1))

const clicked = await page.evaluate(() => {
  const a = [...document.querySelectorAll('a')].filter((x) => x.textContent.trim() === 'Evolve case study').pop()
  let prevented = false
  a.addEventListener('click', (e) => { prevented = e.defaultPrevented }, { once: true })
  a.click()
  return { prevented, locationAfter: location.href }
})
console.log('click result:', JSON.stringify(clicked))
await page.waitForTimeout(3000)
console.log('page.url ->', page.url())
console.log('in-page location ->', await page.evaluate(() => location.href))
await browser.close()
