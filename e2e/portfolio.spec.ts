import { test, expect } from '@playwright/test'

test('home renders identity and real work', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('MD Taufik Reza')
  await expect(page.getByRole('heading', { name: 'Drishti', exact: true })).toBeVisible()
})

test('no dead links — the old site was full of href="#"', async ({ page }) => {
  await page.goto('/')
  expect(await page.locator('a[href="#"]').count()).toBe(0)
})

test('no invented projects survive from the old site', async ({ page }) => {
  await page.goto('/')
  const body = (await page.textContent('body')) ?? ''
  for (const ghost of ['E-Commerce Platform', 'Analytics Dashboard', 'Task Management App']) {
    expect(body).not.toContain(ghost)
  }
})

test('no phone number is exposed', async ({ page }) => {
  await page.goto('/')
  const html = await page.content()
  expect(html).not.toContain('9820092586')
  expect(html).not.toContain('tel:')
})

// The engagement covered government and hospital sites. The segmentation
// diagram is the one place on this site that draws that work, so it is also the
// one place a well-meaning edit could leak something — an address range added
// "for realism", a site name used as a label. This fails the build if it does.
test('the segmentation diagram discloses no client infrastructure', async ({ page }) => {
  await page.goto('/')
  const html = await page.content()

  // Addressing, in the private ranges a real deployment would actually use.
  expect(html).not.toMatch(/\b(?:10|172|192)\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)
  // Interface names and VLAN numbering.
  expect(html).not.toMatch(/\b(?:port[1-9]|wan[12]|vlan\s?\d+)\b/i)

  // The diagram must still be there. A passing check on a deleted figure would
  // be worthless.
  await expect(page.getByRole('img', { name: /segmentation pattern/i })).toBeVisible()
})

test('case study is reachable and returns home', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /case study/i }).first().click()
  await expect(page).toHaveURL(/\/projects\//)
  await page.getByRole('link', { name: /work|back/i }).first().click()
  await expect(page).toHaveURL(/\/$|#work/)
})

test('contact form validates and submits', async ({ page }) => {
  await page.route('**/api/contact', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
  )
  await page.goto('/#contact')
  const form = page.locator('form')
  await form.getByLabel(/name/i).fill('Ada Lovelace')
  await form.getByLabel(/email/i).fill('ada@example.com')
  await form.getByLabel(/message/i).fill('I would like to discuss a security engineering role.')
  await page.getByRole('button', { name: /send/i }).click()
  await expect(page.getByRole('status')).toBeVisible()
})
