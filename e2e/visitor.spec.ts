import { expect, test, type Page } from '@playwright/test'
import fs from 'node:fs'

/** What someone trying the app for the first time does, on a computer and on a phone. */

const readData = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('glow:data') ?? '{}'))

const windows = [
  { label: 'on a computer', viewport: { width: 1280, height: 800 }, phone: false },
  { label: 'on a phone', viewport: { width: 390, height: 844 }, phone: true },
]

for (const { label, viewport, phone } of windows) {
  test.describe(`a visitor ${label}`, () => {
    test.use({ viewport, hasTouch: phone })

    test('opens on a clear first screen and can explore with sample data', async ({ page }) => {
      const problems: string[] = []
      page.on('pageerror', (e) => problems.push(e.message))
      page.on('console', (m) => m.type() === 'error' && problems.push(m.text()))

      await page.goto('/')
      await expect(page.getByRole('button', { name: 'Explore with sample data' })).toBeVisible()
      await expect(page.getByText('No account needed. Nothing leaves your device.')).toBeVisible()
      await page.getByRole('button', { name: 'Explore with sample data' }).click()

      await expect(page.getByText('You’re exploring sample data.')).toBeVisible()
      await expect(page.getByText('Things to try')).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
      expect(problems, problems.join('\n')).toEqual([])
    })

    test('ticking a habit and checking in earn XP that is saved', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('button', { name: 'Explore with sample data' }).click()
      const before = (await readData(page)).xp

      await page.getByRole('checkbox', { name: /Stretch, not done yet/ }).click()
      await expect.poll(async () => (await readData(page)).xp).toBe(before + 10)

      await page.goto('/#/checkin')
      await page.getByRole('radio', { name: 'Good' }).click()
      await page.getByRole('button', { name: 'Save' }).click()
      await expect.poll(async () => Object.keys((await readData(page)).checkIns).length).toBeGreaterThan(0)
      await expect.poll(async () => (await readData(page)).xp).toBe(before + 20)
    })

    test('a locked theme can be previewed without changing anything real', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('button', { name: 'Explore with sample data' }).click()
      await page.goto('/#/settings')
      const realPalette = (await readData(page)).settings.palette

      await page.getByRole('radio', { name: /Aurora/ }).click()
      await expect(page.locator('html')).toHaveAttribute('data-palette', 'aurora')
      expect((await readData(page)).settings.palette).toBe(realPalette)

      await page.getByRole('button', { name: 'Stop preview' }).click()
      await expect(page.locator('html')).toHaveAttribute('data-palette', realPalette)
    })

    test('a backup can be downloaded, the app started over, and the backup restored', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('button', { name: 'Explore with sample data' }).click()
      await page.goto('/#/settings')

      const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download a backup' }).click()])
      const file = await download.path()
      const backup = JSON.parse(fs.readFileSync(file, 'utf8'))
      expect(download.suggestedFilename()).toMatch(/^glow-backup-\d{4}-\d{2}-\d{2}\.json$/)
      expect(backup.habits).toHaveLength(5)

      await page.getByRole('button', { name: 'Start over' }).click()
      await page.getByRole('button', { name: 'Yes, reset' }).click()
      await expect(page.getByRole('button', { name: 'Start fresh' })).toBeVisible()

      await page.getByRole('button', { name: 'Start fresh' }).click()
      await expect(page.getByRole('heading', { name: 'What should we call you?' })).toBeVisible()
      await page.getByRole('button', { name: 'Skip' }).click()
      await expect(page.getByRole('heading', { name: 'Pick a few tiny habits' })).toBeVisible()
      await page.getByRole('button', { name: /Start glowing/ }).click()
      await page.goto('/#/settings')
      await page.setInputFiles('input[type="file"]', file)
      await page.getByRole('button', { name: 'Yes, restore' }).click()
      await expect.poll(async () => (await readData(page)).habits?.length).toBe(5)
    })

    test('a wrong file is refused with a friendly message and changes nothing', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('button', { name: 'Explore with sample data' }).click()
      await page.goto('/#/settings')
      const xp = (await readData(page)).xp

      await page.setInputFiles('input[type="file"]', { name: 'nope.json', mimeType: 'application/json', buffer: Buffer.from('{"hello":"world"}') })
      await expect(page.getByText('That file doesn’t look like a backup made by this app.')).toBeVisible()
      expect((await readData(page)).xp).toBe(xp)
    })

    test('a breathing session runs and the service worker makes the app work offline', async ({ page, context, browserName }) => {
      await page.goto('/')
      await page.getByRole('button', { name: 'Explore with sample data' }).click()
      await page.goto('/#/breathe')
      await expect(page.getByRole('heading', { name: 'Breathe' })).toBeVisible()
      await page.getByRole('button', { name: /Begin/ }).click()
      await expect(page.getByText(/\d:\d\d left/)).toBeVisible()

      // wait until the service worker has installed, saved the whole app for offline use (about 27 files) and taken charge of this page.
      // On a real server the first visit takes a few seconds for this.
      await expect
        .poll(
          () =>
            page.evaluate(async () => {
              const registration = await navigator.serviceWorker?.getRegistration()
              if (registration?.active?.state !== 'activated' || !navigator.serviceWorker.controller) return false
              const names = await caches.keys()
              const counts = await Promise.all(names.map(async (n) => (await (await caches.open(n)).keys()).length))
              return Math.max(0, ...counts) >= 20
            }),
          { timeout: 40_000, intervals: [500] },
        )
        .toBe(true)
      await context.setOffline(true)
      // a screen that has not been opened yet comes out of the saved copy, with no network at all
      await page.goto('/#/progress')
      await expect(page.getByRole('heading', { name: 'Progress' })).toBeVisible()
      // and so does a whole page load (skipped in WebKit: its test build throws an internal error on any offline reload)
      if (browserName !== 'webkit') {
        await page.reload()
        await expect(page.getByRole('heading', { name: 'Progress' })).toBeVisible()
      }
    })
  })
}

test.describe('a visitor with a keyboard', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('number keys switch screens, but not while typing', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Explore with sample data' }).click()
    await page.keyboard.press('4')
    await expect(page).toHaveURL(/#\/progress$/)
    await page.keyboard.press('5')
    await expect(page).toHaveURL(/#\/settings$/)

    await page.getByLabel('Your name', { exact: true }).focus()
    await page.keyboard.press('2')
    await expect(page).toHaveURL(/#\/settings$/)
  })

  test('the About box opens, closes with Escape, and does not block the next click', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'About this project' }).click()
    await expect(page.getByRole('dialog')).toContainText('portfolio project')
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Explore with sample data' }).click()
    await expect(page.getByText('You’re exploring sample data.')).toBeVisible()
  })
})
