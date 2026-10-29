import { expect, test } from '@playwright/test'
import { en } from '../src/i18n/en'
import { es } from '../src/i18n/es'
import { pt } from '../src/i18n/pt'

const catalogs: Record<string, Record<string, string>> = { en, pt, es }
const markers = (text: string) => (text.match(/\{[a-z]+\}/g) ?? []).sort().join(',')

test('every language has exactly the same {markers} as English, so no sentence comes out broken', () => {
  for (const lang of ['pt', 'es']) {
    const wrong = Object.keys(en).filter((key) => markers(en[key as keyof typeof en]) !== markers(catalogs[lang][key]))
    expect(wrong, `${lang}: ${wrong.join(', ')}`).toEqual([])
  }
})

const cases = [
  { lang: 'pt', locale: 'pt-PT', welcome: 'Bem-vindo(a) ao Glow', sample: 'Explorar com dados de exemplo' },
  { lang: 'es', locale: 'es-ES', welcome: 'Te damos la bienvenida a Glow', sample: 'Explorar con datos de ejemplo' },
]

for (const c of cases) {
  test.describe(`browser set to ${c.locale}`, () => {
    test.use({ locale: c.locale, viewport: { width: 1280, height: 800 } })

    test('the app speaks the browser language everywhere, with no English left over', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('h1').first()).toHaveText(c.welcome)
      await expect(page.locator('html')).toHaveAttribute('lang', c.lang)
      await page.getByRole('button', { name: c.sample }).click()
      await page.waitForSelector('main h1')

      // any English sentence from the catalogue that is different in this language must not be on screen
      for (const hash of ['#/home', '#/breathe', '#/checkin', '#/progress', '#/settings']) {
        await page.goto('/' + hash)
        await page.waitForSelector('main h1')
        const text = await page.evaluate(() => document.body.innerText)
        const leaks = Object.entries(en)
          .filter(([key, value]) => value.length >= 16 && !value.includes('{') && catalogs[c.lang][key] !== value && text.includes(value))
          .map(([key]) => key)
        expect(leaks, `${hash}: ${leaks.join(', ')}`).toEqual([])
      }
    })

    test('nothing sticks out of the screen on a small phone', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 700 })
      await page.goto('/')
      await page.getByRole('button', { name: c.sample }).click()
      await page.waitForSelector('main h1')
      for (const hash of ['#/home', '#/breathe', '#/checkin', '#/progress', '#/settings']) {
        await page.goto('/' + hash)
        await page.waitForSelector('main h1')
        expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), hash).toBeLessThanOrEqual(0)
      }
    })
  })
}

test.describe('choosing a language by hand', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('the choice is kept, even after loading the sample data and reloading', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Português' }).click()
    await expect(page.locator('h1').first()).toHaveText('Bem-vindo(a) ao Glow')
    await page.getByRole('button', { name: 'Explorar com dados de exemplo' }).click()
    await page.waitForSelector('main h1')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt')
    await page.waitForSelector('main h1') // the app has started again

    await page.keyboard.press('5')
    await page.getByRole('radio', { name: 'Español' }).click()
    await expect(page.locator('main h1').first()).toHaveText('Ajustes')
    await page.getByRole('radio', { name: 'Automático' }).click()
    await expect(page.locator('main h1').first()).toHaveText('Settings') // the browser here is English
  })

  test('the sample data comes in the chosen language', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Español' }).click()
    await page.getByRole('button', { name: 'Explorar con datos de ejemplo' }).click()
    await page.waitForSelector('main h1')
    const names = await page.evaluate(() => JSON.parse(localStorage.getItem('glow:data') ?? '{}').habits.map((h: { name: string }) => h.name))
    expect(names).toContain('Beber agua')
    expect(names).not.toContain('Drink water')
  })
})
