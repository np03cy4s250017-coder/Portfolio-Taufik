/**
 * Captures project screenshots from the real applications.
 *
 * Requires a static server rooted at D:/My-Projects, because the vanilla-JS
 * apps fetch their JSON and that fails under file://:
 *
 *   python -m http.server 8099 --directory D:/My-Projects
 *
 * Then: node scripts/capture-shots.mjs
 *
 * No stock photography is used anywhere on this site. If a target cannot be
 * captured, its card falls back to a typographic treatment instead.
 */
import { chromium } from '@playwright/test'

const ORIGIN = process.env.SHOTS_ORIGIN ?? 'http://127.0.0.1:8099'

const TARGETS = [
  { path: '/Job_finder/', out: 'devjobs' },
  { path: '/Expense-Tracker/', out: 'fintrack' },
  { path: '/Task-Manager/', out: 'novashop' },
  { path: '/Drishti/DESIGN-PREVIEW.html', out: 'drishti' },
]

const dir = new URL('../public/shots/', import.meta.url).pathname.replace(/^\//, '')

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })

for (const t of TARGETS) {
  const url = `${ORIGIN}${t.path}`
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 })
  } catch {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 })
  }
  await page.waitForTimeout(1500)
  const text = (await page.locator('body').innerText()).trim()
  await page.screenshot({ path: `${dir}${t.out}.png` })
  console.log(`${t.out}: ${text.length} chars visible`)
}

await browser.close()
