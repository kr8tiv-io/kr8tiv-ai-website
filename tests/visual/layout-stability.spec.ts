import fs from 'node:fs'
import path from 'node:path'
import { expect, test, type Page } from '@playwright/test'

const LOCAL_ORIGIN = 'http://127.0.0.1:4173'

const VIEWPORTS = [
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1024x768', width: 1024, height: 768 },
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

async function stepScroll(page: Page, distance: number, settleMs = 420) {
  await page.evaluate((delta) => {
    window.scrollBy({ top: delta, left: 0, behavior: 'auto' })
  }, distance)
  await page.waitForTimeout(settleMs)
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

    test(`${viewport.name} layout stability`, async ({ page }) => {
      test.setTimeout(180_000)
      const issues = collectRuntimeIssues(page)

      await page.goto('/', { waitUntil: 'networkidle' })
      await waitForSceneReady(page)

      await assertNoHorizontalOverflow(page)
      await assertVisibleTextInBounds(page, 'hero-initial')
      await assertNoTransitionOverlay(page)
      await assertNoSlidingReadabilityLayers(page, 'hero-initial')

      for (let i = 0; i < 5; i += 1) {
        await stepScroll(page, 680)
        await assertNoHorizontalOverflow(page)
        await assertVisibleTextInBounds(page, `scroll-${i}`)
        await assertNoSlidingReadabilityLayers(page, `scroll-${i}`)
      }

      await assertNoTransitionOverlay(page)
      await assertNoSlidingReadabilityLayers(page, 'final')

      expect(issues.pageErrors).toEqual([])
      expect(normalizeConsoleErrors(issues.consoleErrors)).toEqual([])
      expect(issues.failedRequests).toEqual([])
      expect(issues.serverErrors).toEqual([])
    })

    test(`@screens ${viewport.name} capture hero sections and footer`, async ({ page }, testInfo) => {
      await page.goto('/', { waitUntil: 'networkidle' })
      await waitForSceneReady(page)

      const dir = screenshotDir(testInfo.project.name, viewport.name)

      await page.screenshot({ path: path.join(dir, 'hero.png'), fullPage: false })

      await stepScroll(page, 900, 620)
      await page.screenshot({ path: path.join(dir, 'section-1.png'), fullPage: false })

      await stepScroll(page, 1700, 700)
      await page.screenshot({ path: path.join(dir, 'section-mid.png'), fullPage: false })

      await stepScroll(page, 2600, 800)
      await page.screenshot({ path: path.join(dir, 'footer.png'), fullPage: false })
    })
  })
}
