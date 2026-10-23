// build-plan/verify/verify.mjs: post-prompt verifier for the kr8tiv.ai improvement pass.
// Usage: npm run build; node build-plan/verify/verify.mjs --checks nav,scrim,... [--lighthouse] [--out DIR] [--tag NAME]
// Serves dist/ with `vite preview`, drives Chromium (Playwright) at 390x844, 768x1024, 1440x900.
// Always-on: no horizontal overflow, no console errors / page errors, no failed requests or 4xx/5xx.
// Exit 0 = pass, 1 = failures (listed), 2 = harness error. Do not edit (driver-owned).
import { chromium } from '@playwright/test'
import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const args = process.argv.slice(2)
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d }
const has = (n) => args.includes(n)
const checks = new Set((opt('--checks', '') || '').split(',').map((s) => s.trim().replace(/^"|"$/g, '')).filter(Boolean))
const doLH = has('--lighthouse')
const tag = opt('--tag', 'manual-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19))
const outDir = opt('--out', path.join(os.homedir(), 'Desktop', 'kr8tiv-ai-runs', tag))
const port = Number(opt('--port', '4317'))
const ROOT = process.cwd()
const BASE = `http://127.0.0.1:${port}`
fs.mkdirSync(outDir, { recursive: true })

const failures = []
const warnings = []
const info = {}
const fail = (m) => { failures.push(m); console.log('FAIL ' + m) }
const warn = (m) => { warnings.push(m); console.log('WARN ' + m) }

const VPS = [
  { name: '390', width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { name: '768', width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { name: '1440', width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
]
const PAGES = [
  { name: 'home', path: '/' },
  { name: 'evolve', path: '/work/evolve/' },
  { name: 'jarvis', path: '/jarvis/' },
  { name: 'kin', path: '/kin/' },
]
if (checks.has('404')) PAGES.push({ name: '404', path: '/404.html' })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------- static checks ----------
if (!fs.existsSync(path.join(ROOT, 'dist', 'index.html'))) { console.log('HARNESS: dist/index.html missing; run npm run build first'); process.exit(2) }
if (checks.has('shader-src')) {
  const rd = (f) => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8') } catch { return '' } }
  const logo = rd('src/experience/Kr8tivLogo.tsx'), smoke = rd('src/experience/SmokeStream.tsx'), fog = rd('src/experience/VolumetricSmoke.tsx'), app = rd('src/App.tsx')
  if (/glitch/i.test(logo)) fail('shader-src: Kr8tivLogo.tsx still contains a glitch term')
  if (/vUv\.y\s*\*\s*40\.0/.test(smoke)) fail('shader-src: SmokeStream.tsx still has the 40x fiber stripes')
  for (const [n, s] of [['SmokeStream.tsx', smoke], ['VolumetricSmoke.tsx', fog], ['Kr8tivLogo.tsx', logo]]) if (s && !/gl_FragCoord/.test(s)) fail(`shader-src: ${n} has no gl_FragCoord dither`)
  if (/\[\s*1\s*,\s*1\s*\]/.test(app)) fail('shader-src: App.tsx still forces a [1, 1] DPR')
}
if (checks.has('404')) {
  const ht = fs.existsSync(path.join(ROOT, 'dist', '.htaccess')) ? fs.readFileSync(path.join(ROOT, 'dist', '.htaccess'), 'utf8') : ''
  if (!fs.existsSync(path.join(ROOT, 'dist', '404.html'))) fail('404: dist/404.html missing')
  if (!/^\s*ErrorDocument\s+404\s+\/404\.html/m.test(ht)) fail('404: dist/.htaccess lacks "ErrorDocument 404 /404.html"')
  if (/^\s*RewriteRule\s+\.\s+\/index\.html/m.test(ht)) fail('404: dist/.htaccess still has the SPA catch-all RewriteRule . /index.html')
}

// ---------- preview server ----------
const viteBin = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js')
const server = spawn(process.execPath, [viteBin, 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] })
let serverOut = ''
server.stdout.on('data', (d) => (serverOut += d)); server.stderr.on('data', (d) => (serverOut += d))
const stopServer = () => { try { server.kill() } catch {} ; if (process.platform === 'win32') { try { execFileSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {} } }
process.on('exit', stopServer)
let up = false
for (let i = 0; i < 60 && !up; i++) { try { const r = await fetch(BASE + '/'); up = r.ok } catch {} ; if (!up) await sleep(500) }
if (!up) { console.log('HARNESS: vite preview did not start\n' + serverOut); stopServer(); process.exit(2) }

const launchArgs = ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=user-gesture-required']
let browser
try { browser = await chromium.launch({ channel: 'chrome', args: launchArgs }) } catch { browser = await chromium.launch({ args: launchArgs }) }

// ---------- in-page helpers ----------
const EFFECTIVE = `(() => { window.__eff = (el) => { let o = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return 0; o *= parseFloat(cs.opacity || '1') } return o } })()`

async function openPage(vp, pg, extra = {}) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.hasTouch, ...extra })
  const page = await ctx.newPage()
  const log = { console: [], pageErrors: [], failed: [], requests: [] }
  page.on('console', (m) => { if (m.type() === 'error') log.console.push(m.text().slice(0, 300)) })
  page.on('pageerror', (e) => log.pageErrors.push(String(e).slice(0, 300)))
  page.on('requestfailed', (r) => { const t = r.failure()?.errorText || ''; if (!/ERR_ABORTED/.test(t)) log.failed.push(`${r.url()} ${t}`) })
  page.on('request', (r) => log.requests.push(r.url()))
  page.on('response', (r) => { if (r.status() >= 400) log.failed.push(`${r.url()} HTTP ${r.status()}`) })
  await page.addInitScript(EFFECTIVE)
  await page.addInitScript(() => { window.__cls = 0; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value }).observe({ type: 'layout-shift', buffered: true }) } catch {} })
  const t0 = Date.now()
  await page.goto(BASE + pg.path, { waitUntil: 'domcontentloaded', timeout: 60000 })
  return { ctx, page, log, t0 }
}

async function scrollStops(page, max = 30) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  const vh = await page.evaluate(() => innerHeight)
  const stops = []
  for (let y = 0, i = 0; y < h && i < max; y += vh, i++) stops.push(y)
  return stops
}

// ---------- main matrix ----------
for (const vp of VPS) {
  for (const pg of PAGES) {
    const key = `${pg.name}@${vp.name}`
    let o
    try {
      o = await openPage(vp, pg)
      const { page, log } = o
      await page.waitForLoadState('load', { timeout: 60000 }).catch(() => warn(`${key}: load event timeout`))
      await sleep(pg.name === 'home' ? 3500 : 1500)
      await page.screenshot({ path: path.join(outDir, `${pg.name}-${vp.name}-top.png`) })

      const ov = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }))
      if (ov.sw > ov.iw + 1) fail(`${key}: horizontal overflow scrollWidth ${ov.sw} > ${ov.iw}`)

      if (checks.has('nav')) {
        const hdr = page.locator('[data-site-header]')
        const n = await hdr.count()
        if (n !== 1) fail(`${key}: nav: expected 1 [data-site-header], found ${n}`)
        else {
          const hb = await hdr.boundingBox()
          if (!hb || !(await hdr.isVisible())) fail(`${key}: nav: header not visible`)
          else if (vp.width === 390 && hb.height > 65) fail(`${key}: nav: header ${Math.round(hb.height)}px tall (> 64)`)
          const want = [/work\/evolve\/?$/, /jarvis\/?$/, /kin\/?$/]
          if (vp.width < 1024) {
            const tg = page.locator('[data-nav-toggle]').first()
            if (!(await tg.count()) || !(await tg.isVisible())) fail(`${key}: nav: [data-nav-toggle] not visible below 1024px`)
            else {
              const tb = await tg.boundingBox()
              if (tb && (tb.width < 43.5 || tb.height < 43.5)) fail(`${key}: nav: toggle ${Math.round(tb.width)}x${Math.round(tb.height)} < 44x44`)
              await tg.click({ timeout: 5000 }).catch((e) => fail(`${key}: nav: toggle click failed ${String(e).slice(0, 120)}`))
              await sleep(500)
              const menu = page.locator('[data-nav-menu]').first()
              if (!(await menu.count()) || !(await menu.isVisible())) fail(`${key}: nav: [data-nav-menu] not visible after toggle`)
              else {
                const hrefs = await menu.locator('a').evaluateAll((as) => as.filter((a) => { const r = a.getBoundingClientRect(); return r.width > 0 && r.height > 0 && window.__eff(a) > 0.5 }).map((a) => a.getAttribute('href') || ''))
                for (const re of [...want, /^tel:/, /^mailto:/]) if (!hrefs.some((h) => re.test(h.split('#')[0].split('?')[0]) || (re.source.startsWith('^') && re.test(h)))) fail(`${key}: nav: menu has no visible link matching ${re}`)
                await page.screenshot({ path: path.join(outDir, `${pg.name}-${vp.name}-menu.png`) })
              }
              if ((await tg.getAttribute('aria-expanded')) !== 'true') fail(`${key}: nav: toggle aria-expanded not "true" when open`)
              await page.keyboard.press('Escape'); await sleep(400)
              if ((await tg.getAttribute('aria-expanded')) === 'true') fail(`${key}: nav: Escape did not close the menu`)
            }
          } else {
            const hrefs = await hdr.locator('a').evaluateAll((as) => as.filter((a) => { const r = a.getBoundingClientRect(); return r.width > 0 && r.height > 0 && window.__eff(a) > 0.5 }).map((a) => a.getAttribute('href') || ''))
            for (const re of want) if (!hrefs.some((h) => re.test(h.split('#')[0].split('?')[0]))) fail(`${key}: nav: header has no visible inline link matching ${re} at >=1024`)
          }
        }
      }

      if (checks.has('tiny-text')) {
        const tiny = await page.evaluate(() => {
          const out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
          for (let n = w.nextNode(); n; n = w.nextNode()) {
            const t = n.textContent.trim(); if (!t) continue
            const el = n.parentElement; if (!el || el.closest('script,style,noscript,template')) continue
            const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue
            if (window.__eff(el) < 0.05) continue
            const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 11.5) out.push(`${fs}px "${t.slice(0, 40)}"`)
          }
          return [...new Set(out)].slice(0, 12)
        })
        if (tiny.length) fail(`${key}: tiny-text: ${tiny.join(' | ')}`)
      }

      if (checks.has('tap-targets')) {
        const small = await page.evaluate((vw) => {
          const out = []
          for (const el of document.querySelectorAll('a[href], button, [role="button"]')) {
            if (el.closest('p') || el.classList.contains('skip-link')) continue
            const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue
            if (r.right < 0 || r.bottom + scrollY < 0) continue
            if (window.__eff(el) < 0.05) continue
            const label = (el.textContent || el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('href') || '').trim().slice(0, 30)
            if (r.width < 23.5 || r.height < 23.5) out.push(`${Math.round(r.width)}x${Math.round(r.height)} "${label}"`)
            else if (vw < 1024 && el.closest('[data-site-header],[data-nav-menu]') && r.height < 43.5) out.push(`header ${Math.round(r.width)}x${Math.round(r.height)} "${label}"`)
          }
          return out.slice(0, 12)
        }, vp.width)
        if (small.length) fail(`${key}: tap-targets: ${small.join(' | ')}`)
      }

      if (pg.name === 'home') {
        const stops = await scrollStops(page, vp.width === 1440 ? 40 : 30)
        info[`scrollHeight@${vp.name}`] = await page.evaluate(() => document.documentElement.scrollHeight)
        const hasCanvas = (await page.locator('canvas').count()) > 0
        const scrimBad = new Set(); const emptyStops = []; let telemetry = new Set()
        for (let i = 0; i < stops.length; i++) {
          await page.evaluate((y) => window.scrollTo(0, y), stops[i]); await sleep(700)
          if (i % 2 === 0 || vp.width !== 1440) await page.screenshot({ path: path.join(outDir, `home-${vp.name}-s${String(i).padStart(2, '0')}.png`) })
          const r = await page.evaluate(() => {
            const vis = []; const bad = []
            for (const el of document.querySelectorAll('h1,h2,h3,p,li,dd,blockquote')) {
              if (el.closest('[data-site-header],[data-nav-menu],noscript')) continue
              const b = el.getBoundingClientRect(); if (b.width < 2 || b.height < 2 || b.bottom < 0 || b.top > innerHeight) continue
              if (!(el.textContent || '').trim() || window.__eff(el) < 0.1) continue
              vis.push(el)
              let ok = false
              for (let e = el; e && e !== document.body; e = e.parentElement) {
                if (!e.hasAttribute || !e.hasAttribute('data-scrim')) continue
                const cs = getComputedStyle(e); const m = cs.backgroundColor.match(/rgba?\(([^)]+)\)/)
                const a = m ? (m[1].split(/[ ,/]+/).filter(Boolean)[3] ?? '1') : '0'
                if (parseFloat(a) >= 0.55 || (cs.backgroundImage && cs.backgroundImage !== 'none')) { ok = true; break }
              }
              if (!ok) bad.push((el.textContent || '').trim().slice(0, 40))
            }
            return { vis: vis.length, bad, text: document.body.innerText }
          })
          if (!r.vis) emptyStops.push(i)
          if (hasCanvas) r.bad.forEach((t) => scrimBad.add(t))
          for (const re of [/\b\d{2}:\d{2}:\d{2}Z\b/, /NOMINAL/i, /\bSYS\.[A-Z]/, /SECTOR 0/i]) { const m = r.text.match(re); if (m) telemetry.add(m[0]) }
        }
        if (checks.has('scrim') && (vp.width === 768 || vp.width === 1440) && scrimBad.size) fail(`${key}: scrim: text without a >=0.55 scrim over the canvas: ${[...scrimBad].slice(0, 6).map((t) => `"${t}"`).join(' | ')}`)
        if (checks.has('scroll-height')) {
          const sh = info[`scrollHeight@${vp.name}`]
          if (vp.width === 390 && sh > 7000) fail(`${key}: scroll-height ${sh} > 7000`)
          if (vp.width === 768 && sh > 8000) fail(`${key}: scroll-height ${sh} > 8000`)
          if (vp.width === 390 && emptyStops.length) fail(`${key}: scroll-height: scroll stops with no visible text: ${emptyStops.join(',')}`)
        }
        if (checks.has('no-telemetry')) {
          if (telemetry.size) fail(`${key}: no-telemetry: found ${[...telemetry].join(', ')}`)
          const floating = await page.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => { const cs = getComputedStyle(e); return (cs.position === 'fixed' || cs.position === 'sticky') && /vibes/i.test(e.textContent || '') && e.getBoundingClientRect().width > 0 && !e.closest('[data-site-header]') }).length)
          if (floating) fail(`${key}: no-telemetry: a fixed/floating element still contains "VIBES"`)
          if (o.log.requests.some((u) => /vibes\.mp3/.test(u))) fail(`${key}: no-telemetry: vibes.mp3 requested without a click`)
        }
        if (checks.has('poster-tier') && vp.width === 390) {
          if (hasCanvas) fail(`${key}: poster-tier: a <canvas> exists at 390`)
          const heavy = o.log.requests.filter((u) => /\.hdr(\?|$)|\/assets\/(three|r3f|Experience)-[^/]*\.js/.test(u))
          if (heavy.length) fail(`${key}: poster-tier: heavy 3D requests at 390: ${heavy.map((u) => u.split('/').pop()).join(', ')}`)
        }
        if (checks.has('poster-tier') && vp.width === 1440) {
          if (!hasCanvas) warn(`${key}: poster-tier: no canvas at 1440 (headless GPU may be slow; check the screenshot)`)
          if (o.log.requests.some((u) => /\.hdr(\?|$)/.test(u))) fail(`${key}: poster-tier: .hdr requested at 1440`)
        }
      }

      if (checks.has('subpage-cls') && vp.width === 390 && ['evolve', 'jarvis', 'kin'].includes(pg.name)) {
        await page.evaluate(() => window.scrollTo(0, 0)); await sleep(1500)
        const cls = await page.evaluate(() => window.__cls)
        info[`cls@${pg.name}`] = Number(cls.toFixed(3))
        if (cls >= 0.1) fail(`${key}: subpage-cls: CLS ${cls.toFixed(3)} >= 0.1`)
        if (!(await page.locator('footer').count())) fail(`${key}: subpage-cls: no <footer>`)
      }

      if (o.log.console.length) fail(`${key}: console errors: ${[...new Set(o.log.console)].slice(0, 4).join(' | ')}`)
      if (o.log.pageErrors.length) fail(`${key}: page errors: ${[...new Set(o.log.pageErrors)].slice(0, 4).join(' | ')}`)
      if (o.log.failed.length) fail(`${key}: failed requests: ${[...new Set(o.log.failed)].slice(0, 4).join(' | ')}`)
    } catch (e) {
      fail(`${key}: harness error ${String(e).slice(0, 300)}`)
    } finally {
      if (o) await o.ctx.close().catch(() => {})
    }
  }
}

// poster visible within 1s at 390 (separate fresh load)
if (checks.has('poster-tier')) {
  const o = await openPage(VPS[0], PAGES[0])
  await sleep(Math.max(0, 1000 - (Date.now() - o.t0)))
  const ok = await o.page.evaluate(() => [...document.querySelectorAll('img')].some((i) => /fallback-scene/.test(i.currentSrc || i.src) && i.complete && i.naturalWidth > 0 && i.getBoundingClientRect().width > 0 && window.__eff(i) > 0.1))
  if (!ok) fail('home@390: poster-tier: poster image not visible within 1 s')
  await o.ctx.close()
}

if (checks.has('reduced-motion')) {
  for (const vp of [VPS[0], VPS[2]]) {
    const o = await openPage(vp, PAGES[0], { reducedMotion: 'reduce' })
    await o.page.waitForLoadState('load').catch(() => {}); await sleep(3000)
    const n = await o.page.locator('canvas').count()
    if (n) fail(`home@${vp.name}: reduced-motion: ${n} canvas element(s) present`)
    const poster = await o.page.evaluate(() => [...document.querySelectorAll('img')].some((i) => /fallback-scene/.test(i.currentSrc || i.src) && i.naturalWidth > 0 && window.__eff(i) > 0.1))
    if (!poster) fail(`home@${vp.name}: reduced-motion: poster not visible`)
    await o.page.screenshot({ path: path.join(outDir, `home-${vp.name}-reduced-motion.png`) })
    if (o.log.console.length || o.log.pageErrors.length) fail(`home@${vp.name}: reduced-motion: console/page errors: ${[...o.log.console, ...o.log.pageErrors].slice(0, 3).join(' | ')}`)
    await o.ctx.close()
  }
}

await browser.close()

// ---------- lighthouse (informational) ----------
if (doLH) {
  const chrome = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find((p) => fs.existsSync(p))
  for (const pg of [PAGES[0], PAGES[1]]) {
    const out = path.join(outDir, `lh-${pg.name}-mobile.json`)
    try {
      execFileSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['--yes', 'lighthouse@12', BASE + pg.path, '--form-factor=mobile', '--only-categories=performance,accessibility,best-practices,seo', '--output=json', `--output-path=${out}`, '--quiet', '--chrome-flags=--headless=new'], { stdio: 'ignore', timeout: 240000, shell: process.platform === 'win32', env: { ...process.env, ...(chrome ? { CHROME_PATH: chrome } : {}) } })
      const j = JSON.parse(fs.readFileSync(out, 'utf8'))
      const s = (c) => Math.round((j.categories[c]?.score ?? 0) * 100)
      const a = (id) => j.audits[id]
      info[`lighthouse-mobile@${pg.name}`] = { performance: s('performance'), accessibility: s('accessibility'), bestPractices: s('best-practices'), seo: s('seo'), LCP: a('largest-contentful-paint')?.displayValue, CLS: a('cumulative-layout-shift')?.displayValue, TBT: a('total-blocking-time')?.displayValue, targetSize: a('target-size')?.score, colorContrast: a('color-contrast')?.score, bytes: a('total-byte-weight')?.displayValue }
      console.log(`LIGHTHOUSE mobile ${pg.path}: ` + JSON.stringify(info[`lighthouse-mobile@${pg.name}`]))
    } catch (e) { warn(`lighthouse ${pg.path} failed: ${String(e).slice(0, 200)}`) }
  }
}

stopServer()
const result = { tag, checks: [...checks], failures, warnings, info, outDir }
fs.writeFileSync(path.join(outDir, 'verify-result.json'), JSON.stringify(result, null, 2))
console.log(`VERIFY ${failures.length ? 'FAIL' : 'PASS'} (${failures.length} failure(s), ${warnings.length} warning(s)) screenshots: ${outDir}`)
console.log('INFO ' + JSON.stringify(info))
process.exit(failures.length ? 1 : 0)
