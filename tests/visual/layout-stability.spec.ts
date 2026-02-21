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

async function assertScannerOpacity(page: Page) {
  const scannerOpacity = await page.locator('[data-testid="transition-scanner"]').evaluate((el) => {
    return Number.parseFloat(window.getComputedStyle(el).opacity || '0')
  })

  expect(scannerOpacity).toBeLessThanOrEqual(0.2)
}

function normalizeConsoleErrors(consoleErrors: string[]) {
  return consoleErrors.filter((line) => !/favicon|sourcemap|source map|ResizeObserver loop limit exceeded/i.test(line))
}

function screenshotDir(browserName: string, viewportName: string) {
  const dir = path.join(process.cwd(), 'artifacts', 'visual', 'screenshots', browserName, viewportName)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

for (const viewport of VIEWPORTS) {
  test.describe(`viewport ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    test(`${viewport.name} layout stability`, async ({ page }) => {
      const issues = collectRuntimeIssues(page)

      await page.goto('/', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1200)

      await expect(page.locator('[data-testid="hero-content"]')).toBeVisible()
      await assertNoHorizontalOverflow(page)
      await assertVisibleTextInBounds(page, 'hero-initial')
      await assertScannerOpacity(page)

      for (let i = 0; i < 7; i += 1) {
        await page.mouse.wheel(0, 680)
        await page.waitForTimeout(520)
        await assertNoHorizontalOverflow(page)
        await assertVisibleTextInBounds(page, `scroll-${i}`)
        await assertScannerOpacity(page)
      }

      expect(issues.pageErrors).toEqual([])
      expect(normalizeConsoleErrors(issues.consoleErrors)).toEqual([])
      expect(issues.failedRequests).toEqual([])
      expect(issues.serverErrors).toEqual([])
    })

    test(`@screens ${viewport.name} capture hero sections and footer`, async ({ page, browserName }) => {
      await page.goto('/', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1200)

      const dir = screenshotDir(browserName, viewport.name)

      await page.screenshot({ path: path.join(dir, 'hero.png'), fullPage: false })

      await page.mouse.wheel(0, 900)
      await page.waitForTimeout(700)
      await page.screenshot({ path: path.join(dir, 'section-1.png'), fullPage: false })

      await page.mouse.wheel(0, 1700)
      await page.waitForTimeout(700)
      await page.screenshot({ path: path.join(dir, 'section-mid.png'), fullPage: false })

      await page.mouse.wheel(0, 2600)
      await page.waitForTimeout(700)
      await page.screenshot({ path: path.join(dir, 'footer.png'), fullPage: false })
    })
  })
}
