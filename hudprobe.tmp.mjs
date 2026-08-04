import { chromium } from '@playwright/test'

const BASE = process.argv[2] || 'http://72.61.7.126:8093'
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(9000)

const total = await page.evaluate(() => document.body.scrollHeight)
for (let i = 1; i <= 24; i++) {
  const y = Math.round((total - 900) * (i / 24))
  await page.mouse.wheel(0, (total - 900) / 24)
  await page.waitForTimeout(700)
  const state = await page.evaluate(() => {
    const panels = [...document.querySelectorAll('.hud-panel')]
    const vis = panels
      .map((p) => {
        const r = p.getBoundingClientRect()
        const onScreen = r.top < innerHeight && r.bottom > 0 && getComputedStyle(p).opacity > 0.2
        if (!onScreen) return null
        return {
          sys: p.querySelector('.font-mono')?.textContent,
          values: [...p.querySelectorAll('.hud-data-item')].map((d) =>
            d.textContent.replace(/\s+/g, ' ').trim()
          ),
        }
      })
      .filter(Boolean)
    return { y: Math.round(scrollY), vis }
  })
  if (state.vis.length) {
    console.log(`y=${state.y}`, JSON.stringify(state.vis[0]).slice(0, 300))
  }
}
await browser.close()
