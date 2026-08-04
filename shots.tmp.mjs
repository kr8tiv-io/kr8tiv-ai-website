/* Cross-browser / cross-device capture + health check.
   node shots.mjs <baseURL> <outDir> [browsers]  */
import { chromium, firefox, webkit } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const BASE = (process.argv[2] || 'http://127.0.0.1:4175').replace(/\/$/, '')
const OUT = process.argv[3] || './shots'
const ONLY = (process.argv[4] || '').split(',').filter(Boolean)

const PAGES = [
  { slug: 'home', url: '/' },
  { slug: 'evolve', url: '/work/evolve/' },
  { slug: 'jarvis', url: '/jarvis/' },
  { slug: 'kin', url: '/kin/' },
]

const VIEWPORTS = [
  { name: '390', width: 390, height: 844, mobile: true },
  { name: '768', width: 768, height: 1024, mobile: true },
  { name: '1440', width: 1440, height: 900, mobile: false },
]

const ENGINES = [
  { id: 'chrome', launcher: chromium, opts: {} },
  { id: 'edge', launcher: chromium, opts: { channel: 'msedge' } },
  { id: 'firefox', launcher: firefox, opts: {} },
  { id: 'safari', launcher: webkit, opts: {} },
]

const IOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'

mkdirSync(OUT, { recursive: true })
const report = []

for (const eng of ENGINES) {
  if (ONLY.length && !ONLY.includes(eng.id)) continue
  let browser
  try {
    browser = await eng.launcher.launch({ headless: true, ...eng.opts })
  } catch (e) {
    report.push({ engine: eng.id, error: `launch failed: ${String(e).slice(0, 200)}` })
    continue
  }

  for (const vp of VIEWPORTS) {
    const ctxOpts = {
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
present: undefined,
    }
    delete ctxOpts.present
    if (eng.id === 'safari' && vp.mobile) {
      ctxOpts.userAgent = IOS_UA
      ctxOpts.isMobile = true
      ctxOpts.hasTouch = true
    }
    const context = await browser.newContext(ctxOpts)

    for (const p of PAGES) {
      const page = await context.newPage()
      const errors = []
      const failed = []
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
      page.on('pageerror', (e) => errors.push(`pageerror: ${String(e).slice(0, 200)}`))
      page.on('requestfailed', (r) => failed.push(`${r.url().slice(0, 140)} :: ${r.failure()?.errorText}`))
      page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url().slice(0, 140)}`) })

      const t0 = Date.now()
      let loadErr = null
      try {
        await page.goto(BASE + p.url, { waitUntil: 'domcontentloaded', timeout: 45000 })
        await page.waitForTimeout(p.slug === 'home' ? 9000 : 2500)
      } catch (e) {
        loadErr = String(e).slice(0, 200)
      }
      const ms = Date.now() - t0

      let metrics = {}
      try {
        metrics = await page.evaluate(() => ({
          scrollW: document.documentElement.scrollWidth,
          clientW: document.documentElement.clientWidth,
          scrollH: document.documentElement.scrollHeight,
          title: document.title,
          h1: document.querySelector('h1')?.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80) || null,
          bodyText: (document.body.innerText || '').replace(/\s+/g, ' ').length,
          tokenHit: /(\$KR8TIV|tokeniz|bags\.fm|Solana|crypto|open source|Anarcho)/i.test(
            document.body.innerText || ''
          ),
        }))
      } catch { /* ignore */ }

      const file = path.join(OUT, `${eng.id}-${vp.name}-${p.slug}.png`)
      try { await page.screenshot({ path: file }) } catch { /* ignore */ }

      report.push({
        engine: eng.id, vp: vp.name, page: p.slug, ms, loadErr,
        overflow: metrics.clientW ? metrics.scrollW - metrics.clientW : null,
        title: metrics.title, h1: metrics.h1, textLen: metrics.bodyText,
        tokenHit: metrics.tokenHit,
        errors: errors.slice(0, 5), failed: failed.slice(0, 5),
      })
      console.log(
        `${eng.id.padEnd(8)} ${vp.name.padEnd(5)} ${p.slug.padEnd(7)} ` +
        `${String(ms).padStart(5)}ms  ovf=${metrics.clientW ? metrics.scrollW - metrics.clientW : '?'}  ` +
        `err=${errors.length} fail=${failed.length} token=${metrics.tokenHit}` +
        (loadErr ? `  LOADERR ${loadErr}` : '')
      )
      await page.close()
    }
    await context.close()
  }
  await browser.close()
}

writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2))
const bad = report.filter((r) => r.loadErr || r.tokenHit || (r.overflow ?? 0) > 1 || r.errors?.length || r.failed?.length)
console.log(`\n=== ${report.length} checks, ${bad.length} with issues ===`)
for (const b of bad) console.log(JSON.stringify(b))
