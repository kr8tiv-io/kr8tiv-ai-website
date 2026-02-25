import fs from 'node:fs'
import path from 'node:path'
import { expect, test, type Page } from '@playwright/test'

const LOCAL_ORIGIN = 'http://127.0.0.1:4173'

const VIEWPORTS = [
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '390x844', width: 390, height: 844 },
  { name: '375x667', width: 375, height: 667 },
] as const

type IssuesBag = {
  pageErrors: string[]
  consoleErrors: string[]
  failedRequests: string[]
  serverErrors: string[]
}

function collectRuntimeIssues(page: Page): IssuesBag {
  const issues: IssuesBag = {
    pageErrors: [],
    consoleErrors: [],
    failedRequests: [],
    serverErrors: [],
  }

  page.on('pageerror', (error) => {
    issues.pageErrors.push(error.message)
  })

  page.on('console', (message) => {
    if (message.type() === 'error') {
      issues.consoleErrors.push(message.text())
    }
  })

  page.on('requestfailed', (request) => {
    if (request.url().startsWith(LOCAL_ORIGIN)) {
      const failureText = request.failure()?.errorText ?? 'unknown request failure'
      issues.failedRequests.push(`${failureText} :: ${request.url()}`)
    }
  })

  page.on('response', (response) => {
    if (response.url().startsWith(LOCAL_ORIGIN) && response.status() >= 500) {
      issues.serverErrors.push(`${response.status()} :: ${response.url()}`)
    }
  })

  return issues
}

async function assertNoHorizontalOverflow(page: Page) {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }))

  expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 2)
}

async function waitForSceneReady(page: Page) {
  const introTagline = page.getByText('Building the intelligence layer beneath every industry.')
  if (await introTagline.count()) {
    await expect(introTagline).toBeHidden({ timeout: 25_000 })
  }

  const initializing = page.getByText('Initializing')
  if (await initializing.count()) {
    await expect(initializing).toBeHidden({ timeout: 25_000 })
  }

  await expect(page.locator('[data-testid="hero-content"]')).toBeVisible({ timeout: 20_000 })
  await page.waitForTimeout(700)
}

async function assertVisibleTextInBounds(page: Page, stage: string) {
  const result = await page.evaluate(() => {
    const selectors = [
      '[data-testid="hero-headline"]',
      '[data-testid="hero-copy"]',
      '.section-inner h2',
      '.section-inner p',
    ]

    const outOfBounds: string[] = []

    for (const selector of selectors) {
      const elements = document.querySelectorAll<HTMLElement>(selector)
      elements.forEach((element) => {
        const styles = window.getComputedStyle(element)
        const opacity = Number.parseFloat(styles.opacity || '1')
        if (styles.display === 'none' || styles.visibility === 'hidden' || opacity < 0.05) {
          return
        }

        const rect = element.getBoundingClientRect()
        const visible = rect.bottom > 0 && rect.top < window.innerHeight
        if (!visible) {
          return
        }

        if (rect.left < -1 || rect.right > window.innerWidth + 1) {
          const text = (element.textContent ?? '').trim().slice(0, 40)
          outOfBounds.push(`${selector} :: ${text}`)
        }
      })
    }

    return { outOfBounds }
  })

  expect(result.outOfBounds, `visible text overflow at ${stage}`).toEqual([])
}

async function assertActiveSectionVerticalFit(page: Page, stage: string) {
  const result = await page.evaluate(() => {
    const sectionInners = Array.from(document.querySelectorAll<HTMLElement>('.section-inner'))
    const violations: string[] = []

    sectionInners.forEach((sectionInner) => {
      const sectionOpacity = Number.parseFloat(window.getComputedStyle(sectionInner).opacity || '0')
      if (sectionOpacity < 0.55) {
        return
      }

      const textNodes = sectionInner.querySelectorAll<HTMLElement>('h2, p')
      textNodes.forEach((element) => {
        const styles = window.getComputedStyle(element)
        const opacity = Number.parseFloat(styles.opacity || '1')
        if (styles.display === 'none' || styles.visibility === 'hidden' || opacity < 0.05) {
          return
        }

        const rect = element.getBoundingClientRect()
        const isInViewportBand = rect.bottom > 0 && rect.top < window.innerHeight
        if (!isInViewportBand) {
          return
        }

        if (rect.top < -1 || rect.bottom > window.innerHeight + 1) {
          const text = (element.textContent ?? '').trim().slice(0, 45)
          violations.push(`${text} :: top=${rect.top.toFixed(1)} bottom=${rect.bottom.toFixed(1)} vh=${window.innerHeight}`)
        }
      })
    })

    return { violations }
  })

  expect(result.violations, `active section vertical clipping at ${stage}`).toEqual([])
}

async function assertNoTransitionOverlay(page: Page) {
  const scannerCount = await page.locator('[data-testid="transition-scanner"]').count()
  expect(scannerCount).toBe(0)
}

async function assertNoSlidingReadabilityLayers(page: Page, stage: string) {
  const result = await page.evaluate(() => {
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>('.content-section > .absolute.inset-0.pointer-events-none')
    )

    const movingLayerRegex = /(linear-gradient\(to right|linear-gradient\(to left|repeating-linear-gradient\(0deg)/i

    const movingLayers = candidates
      .map((element) => {
        const inlineBackground = element.style.background || ''
        const computedBackground = window.getComputedStyle(element).backgroundImage || ''
        return `${inlineBackground} ${computedBackground}`
      })
      .filter((background) => movingLayerRegex.test(background))

    return {
      count: movingLayers.length,
      samples: movingLayers.slice(0, 4),
    }
  })

  expect(result.count, `unexpected moving readability layers at ${stage}: ${result.samples.join(' | ')}`).toBe(0)
}

async function stepScroll(page: Page, distance: number, settleMs = 340) {
  await page.evaluate((delta) => {
    window.scrollBy({ top: delta, left: 0, behavior: 'auto' })
  }, distance)
  await page.waitForTimeout(settleMs)
}

async function focusSectionByHeading(page: Page, headingSnippet: string) {
  const target = page.locator('.section-inner h2', { hasText: headingSnippet }).first()
  await expect(target).toBeVisible({ timeout: 20_000 })

  for (let i = 0; i < 40; i += 1) {
    const state = await target.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      const sectionInner = element.closest('.section-inner')
      const sectionOpacity = Number.parseFloat(window.getComputedStyle(sectionInner ?? element).opacity || '0')
      return {
        top: rect.top,
        bottom: rect.bottom,
        inViewport: rect.bottom > 24 && rect.top < window.innerHeight - 24,
        active: sectionOpacity > 0.35,
      }
    })

    if (state.inViewport && state.active) {
      await page.waitForTimeout(500)
      await expect(target).toBeInViewport({ ratio: 0.1 })
      return
    }

    const delta = state.top < -24 ? -260 : 460
    await stepScroll(page, delta, 300)
  }

  throw new Error(`unable to focus section for heading snippet: ${headingSnippet}`)
}

function normalizeConsoleErrors(consoleErrors: string[]) {
  return consoleErrors.filter((line) => !/favicon|sourcemap|source map|ResizeObserver loop limit exceeded/i.test(line))
}

function screenshotDir(projectName: string, viewportName: string) {
  const dir = path.join(process.cwd(), 'artifacts', 'visual', 'screenshots', projectName, viewportName)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

for (const viewport of VIEWPORTS) {
  test.describe(`viewport ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    test(`${viewport.name} layout stability`, async ({ page }, testInfo) => {
      test.setTimeout(240_000)
      if (testInfo.project.name === 'edge' && viewport.width < 768) {
        test.skip()
      }
      const issues = collectRuntimeIssues(page)

      await page.goto('/', { waitUntil: 'networkidle' })
      await waitForSceneReady(page)

      await assertNoHorizontalOverflow(page)
      await assertVisibleTextInBounds(page, 'hero-initial')
      await assertActiveSectionVerticalFit(page, 'hero-initial')
      await assertNoTransitionOverlay(page)
      await assertNoSlidingReadabilityLayers(page, 'hero-initial')

      for (let i = 0; i < 5; i += 1) {
        await stepScroll(page, 680)
        await assertNoHorizontalOverflow(page)
        await assertVisibleTextInBounds(page, `scroll-${i}`)
        await assertActiveSectionVerticalFit(page, `scroll-${i}`)
        if (i % 2 === 0) {
          await assertNoSlidingReadabilityLayers(page, `scroll-${i}`)
        }
      }

      await focusSectionByHeading(page, 'Bespoke AI.')
      await expect(page.locator('.section-inner h2', { hasText: 'Bespoke AI.' }).first()).toBeVisible()
      await expect(page.getByText('even your grandmother can use it', { exact: false })).toBeVisible()
      await expect(page.locator('a[href="https://meetyourkin.com"]').first()).toBeVisible()
      await expect(page.locator('a[href="https://x.com/meetyourkin"]').first()).toBeVisible()

      await assertNoTransitionOverlay(page)
      await assertNoSlidingReadabilityLayers(page, 'final')

      expect(issues.pageErrors).toEqual([])
      expect(normalizeConsoleErrors(issues.consoleErrors)).toEqual([])
      expect(issues.failedRequests).toEqual([])
      expect(issues.serverErrors).toEqual([])
    })

    test(`@screens ${viewport.name} capture hero sections and footer`, async ({ page }, testInfo) => {
      test.setTimeout(240_000)
      if (testInfo.project.name === 'edge' && viewport.width < 768) {
        test.skip()
      }
      await page.goto('/', { waitUntil: 'networkidle' })
      await waitForSceneReady(page)

      const dir = screenshotDir(testInfo.project.name, viewport.name)

      await page.screenshot({ path: path.join(dir, 'hero.png'), fullPage: false })

      await stepScroll(page, 900, 620)
      await page.screenshot({ path: path.join(dir, 'section-1.png'), fullPage: false })

      await stepScroll(page, 1700, 700)
      await page.screenshot({ path: path.join(dir, 'section-mid.png'), fullPage: false })

      await focusSectionByHeading(page, 'Bespoke AI.')
      await page.screenshot({ path: path.join(dir, 'section-kin.png'), fullPage: false })

      await stepScroll(page, 2600, 800)
      await page.screenshot({ path: path.join(dir, 'footer.png'), fullPage: false })
    })
  })
}
