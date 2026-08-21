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
