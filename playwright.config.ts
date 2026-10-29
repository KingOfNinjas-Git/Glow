import { defineConfig } from '@playwright/test'

/**
 * Browser tests: the app is opened in real Firefox and WebKit (the engine behind Safari), on a computer-sized and
 * a phone-sized window, and used the way a visitor would use it.
 *
 *   npm run build            (once, the tests open the built app)
 *   npm run test:e2e
 *
 * First time on a machine: npx playwright install firefox webkit   (add chromium to try Chrome too: WITH_CHROMIUM=1)
 * Point it at a live address instead with BASE_URL=https://glow.franciscowebdev.com npm run test:e2e
 */
const projects = [
  { name: 'firefox', use: { browserName: 'firefox' as const } },
  { name: 'webkit', use: { browserName: 'webkit' as const } },
  ...(process.env.WITH_CHROMIUM ? [{ name: 'chromium', use: { browserName: 'chromium' as const } }] : []),
]

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: process.env.BASE_URL ?? 'http://localhost:4173', locale: 'en-GB', acceptDownloads: true },
  projects,
  webServer: process.env.BASE_URL
    ? undefined
    : { command: 'npm run preview -- --port 4173 --strictPort', url: 'http://localhost:4173', reuseExistingServer: true, timeout: 60_000 },
})
