import { test, expect, type Page } from '@playwright/test'

/** The breakpoints spec §6 commits to testing. */
const WIDTHS = [375, 768, 1024, 1440] as const

const PATHS = ['/', '/projects/drishti', '/projects/network-segmentation-deployment'] as const

async function horizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const d = document.documentElement
    return { scrollWidth: d.scrollWidth, clientWidth: d.clientWidth }
  })
}

for (const width of WIDTHS) {
  test(`no horizontal scroll at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const path of PATHS) {
      await page.goto(path)
      const { scrollWidth, clientWidth } = await horizontalOverflow(page)
      // 1px of tolerance for sub-pixel rounding.
      expect(scrollWidth, `${path} overflows at ${width}px`).toBeLessThanOrEqual(clientWidth + 1)
    }
  })
}

test('interactive controls meet the 44px tap-target floor', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 })
  await page.goto('/')

  const controls = page.locator('a, button')
  const count = await controls.count()
  const tooSmall: string[] = []

  for (let i = 0; i < count; i++) {
    const el = controls.nth(i)
    const box = await el.boundingBox()
    // Skip the off-screen honeypot and the sr-only skip link, which are
    // deliberately not pointer targets until focused.
    if (!box || box.height < 8 || box.x < 0) continue
    if (box.height < 44) tooSmall.push(`${(await el.innerText()).trim() || '(icon)'} → ${box.height}px`)
  }

  expect(tooSmall, `controls under 44px: ${tooSmall.join(', ')}`).toEqual([])
})

test('reduced motion leaves content visible with no transition', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('/')

  // The work grid sits below the fold, so under prefers-reduce it must already
  // be at final state rather than waiting on an observer.
  const card = page.getByRole('heading', { name: 'Drishti', exact: true })
  const wrapper = page.locator('[data-reveal]').first()

  await expect(card).toBeVisible()
  const styles = await wrapper.evaluate((el) => {
    const cs = getComputedStyle(el)
    return { opacity: cs.opacity, transitionDuration: cs.transitionDuration }
  })
  expect(styles.opacity).toBe('1')
  expect(styles.transitionDuration).toBe('0s')

  await context.close()
})

test('keyboard focus reaches the skip link first and it is visible', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  const focused = page.locator(':focus')
  await expect(focused).toHaveText(/skip to content/i)
  const box = await focused.boundingBox()
  expect(box, 'skip link should be on-screen once focused').not.toBeNull()
  expect(box!.x).toBeGreaterThanOrEqual(0)
})

test('content stays visible with JavaScript disabled', async ({ browser }) => {
  // globals.css hides every [data-reveal] element and only the observer ever
  // un-hides it, so without the <noscript> override in layout.tsx everything
  // below the hero would be permanently invisible to a no-JS reader.
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Drishti', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Experience' })).toBeVisible()

  const opacity = await page
    .locator('[data-reveal]')
    .first()
    .evaluate((el) => getComputedStyle(el).opacity)
  expect(opacity).toBe('1')

  await context.close()
})

test('the CV download is served but excluded from search indexes', async ({ request }) => {
  // The PDF contains a phone number the site strips from every page, so it
  // must stay downloadable for recruiters while staying out of the index.
  const res = await request.get('/MD_Taufik_Reza_CV.pdf')
  expect(res.status()).toBe(200)
  expect(res.headers()['x-robots-tag']).toContain('noindex')
})
