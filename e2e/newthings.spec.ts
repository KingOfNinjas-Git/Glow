import { expect, test, type Page } from '@playwright/test'

/** The newer parts: habits with their own weekdays, the two extra breathing exercises, and the garden after the last unlock. */

const readData = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('glow:data') ?? '{}'))

const explore = async (page: Page) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Explore with sample data' }).click()
  await expect(page.getByText('You’re exploring sample data.')).toBeVisible()
}

for (const [label, viewport, phone] of [
  ['on a computer', { width: 1280, height: 800 }, false],
  ['on a phone', { width: 390, height: 844 }, true],
] as const) {
  test.describe(`newer features ${label}`, () => {
    test.use({ viewport, hasTouch: phone })

    test('a habit can be given its own days, and waits quietly on the other days', async ({ page }) => {
      await explore(page)
      await page.getByRole('button', { name: '+ Add' }).click()
      await page.getByLabel('Name').fill('Evening walk')
      // choose only the day it is NOT today, so we know where it should show up
      const today = await page.evaluate(() => new Date().getDay())
      const other = (today + 3) % 7
      const name = await page.evaluate((d) => new Date(2026, 0, 4 + d).toLocaleDateString('en-GB', { weekday: 'short' }), other)
      await page.getByRole('button', { name, exact: true }).click()
      await expect(page.getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true')
      await expect(page.getByRole('button', { name: 'Every day' })).toHaveAttribute('aria-pressed', 'false')
      await page.getByRole('button', { name: 'Add habit' }).click()

      // saved with that one weekday, and shown under "for another day", not in today's list
      await expect.poll(async () => (await readData(page)).habits.find((h: { name: string }) => h.name === 'Evening walk')?.days).toEqual([other])
      const others = page.getByText(/habits? for (another day|other days)/)
      await expect(others).toBeVisible()
      await expect(page.getByRole('checkbox', { name: /Evening walk/ })).toBeHidden()
      await others.click()
      await expect(page.getByRole('checkbox', { name: /Evening walk, not done yet/ })).toBeVisible()
      await expect(page.getByText(`Only ${name}`)).toBeVisible()

      // ticking it anyway still counts and earns XP (no locks, no scolding)
      const before = (await readData(page)).xp
      await page.getByRole('checkbox', { name: /Evening walk, not done yet/ }).click()
      await expect.poll(async () => (await readData(page)).xp).toBe(before + 10)

      // back to every day: it moves up into today's list
      await page.getByRole('button', { name: /Edit Evening walk/ }).click()
      await page.getByRole('button', { name: 'Every day' }).click()
      await page.getByRole('button', { name: 'Save', exact: true }).click()
      await expect.poll(async () => 'days' in ((await readData(page)).habits.find((h: { name: string }) => h.name === 'Evening walk') ?? {})).toBe(false)
      await expect(page.getByRole('checkbox', { name: /Evening walk/ })).toBeVisible() // now in today's list, no need to open anything
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
    })

    test('there are five breathing exercises, including the sigh and the coherent one', async ({ page }) => {
      await explore(page)
      await page.goto('/#/breathe')
      for (const name of ['Box', '4-7-8', 'Calm', 'Coherent', 'Sigh']) {
        await expect(page.getByRole('radio', { name: new RegExp(name) })).toBeVisible()
      }
      await page.getByRole('radio', { name: /Sigh/ }).click()
      await page.getByRole('button', { name: /Begin/ }).click()
      await expect(page.getByText('Inhale').first()).toBeVisible()
      await page.getByRole('button', { name: 'Stop here' }).click()
      await expect(page.getByText('That’s okay.')).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
    })

    test('the garden is closed at first and grows plants after level 15', async ({ page }) => {
      await explore(page)
      await page.goto('/#/progress')
      await expect(page.getByRole('heading', { name: 'Your garden' })).toBeVisible()
      await expect(page.getByText(/Reach level 16 and a garden opens/)).toBeVisible()

      // jump the sample to level 20 with the sample bar: three plants
      const raise = page.getByRole('button', { name: 'Raise the level' })
      const level = page.locator('output').first()
      await expect(raise).toBeVisible()
      for (let i = 0; i < 40 && (await level.textContent()) !== '20'; i++) await raise.click()
      await expect(level).toHaveText('20')
      await expect(page.getByText('3 plants')).toBeVisible()
      await expect(page.getByText('The next plant grows at level 22.')).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
    })
  })
}
