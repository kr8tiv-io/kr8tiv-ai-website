import { chromium } from '@playwright/test'
const BASE = (process.argv[2] || 'http://72.61.7.126:8093').replace(/\/$/, '')
const browser = await chromium.launch({ headless: true })

async function homePage(vp) {
  const ctx = await browser.newContext({ viewport: vp })
  const page = await ctx.newPage()
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(
    () =>
      ![...document.querySelectorAll('div')].some((d) => {
        const cs = getComputedStyle(d)
        if (cs.position !== 'fixed' || cs.display === 'none') return false
        const r = d.getBoundingClientRect()
        return r.width >= innerWidth * 0.95 && r.height >= innerHeight * 0.95 &&
          Number(cs.opacity) > 0.01 && Number(cs.zIndex) >= 80
      }),
    { timeout: 60000 }
  )
  await page.waitForTimeout(1500)
  return { ctx, page }
}

for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  // top bar (desktop)
  if (vp.width >= 1024) {
    const { ctx, page } = await homePage(vp)
    const hrefs = await page.$$eval('nav[aria-label="Pages"] a', (as) =>
      as.map((a) => `${a.textContent.trim()}=${a.getAttribute('href')}`)
    )
    console.log(`topbar ${vp.width} hrefs: ${hrefs.join('  ')}`)
    await ctx.close()
  }

  // footer links: scroll each into view, hit-test, then click
  for (const [label, expect] of [
    ['Evolve case study', '/work/evolve/'],
    ['JARVIS', '/jarvis/'],
    ['KIN', '/kin/'],
  ]) {
    const { ctx, page } = await homePage(vp)
    const total = await page.evaluate(() => document.body.scrollHeight)
    for (let i = 0; i < 30; i++) { await page.mouse.wheel(0, (total - vp.height) / 30); await page.waitForTimeout(120) }
    await page.waitForTimeout(2500)
    const probe = await page.evaluate((lbl) => {
      const a = [...document.querySelectorAll('a')].filter((x) => x.textContent.trim() === lbl).pop()
      if (!a) return { found: false }
      a.scrollIntoView({ block: 'center' })
      const r = a.getBoundingClientRect()
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
      return {
        found: true,
        href: a.getAttribute('href'),
        rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width)],
        opacity: getComputedStyle(a).opacity,
        parentOpacity: getComputedStyle(a.closest('.section-inner') || a).opacity,
        hitIsLink: top === a || a.contains(top),
        hitTag: top ? top.tagName + '.' + (top.className || '').toString().slice(0, 30) : null,
      }
    }, label)
    await page.evaluate((lbl) => {
      [...document.querySelectorAll('a')].filter((x) => x.textContent.trim() === lbl).pop()?.click()
    }, label)
    await page.waitForTimeout(2500)
    const url = page.url()
    console.log(`footer ${vp.width} "${label}" href=${probe.href} hit=${probe.hitIsLink} (${probe.hitTag}) op=${probe.opacity}/${probe.parentOpacity} -> RAWURL[${url}] ${url.includes(expect) ? 'OK' : 'MISMATCH'}`)
    await ctx.close()
  }
}
await browser.close()
