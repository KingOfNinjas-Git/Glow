import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_TAGLINE,
  APP_TITLE,
  AUTHOR,
  SITE_URL,
  STORAGE_KEY,
  THEME_COLOR_LIGHT,
} from './src/config/app.ts'

/** The hash of the page's one inline script, worked out while building so the security policy never goes out of date. */
let inlineScriptHash = ''

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'inject-app-config',
      transformIndexHtml: (html) =>
        html
          .replaceAll('__APP_TITLE__', APP_TITLE)
          .replaceAll('__APP_DESCRIPTION__', APP_DESCRIPTION)
          .replaceAll('__APP_NAME__', APP_NAME)
          .replaceAll('__APP_TAGLINE__', APP_TAGLINE)
          .replaceAll('__STORAGE_KEY__', STORAGE_KEY)
          .replaceAll('__SITE_URL__', SITE_URL)
          .replaceAll('__AUTHOR_NAME__', AUTHOR.name)
          .replaceAll('__AUTHOR_URL__', AUTHOR.url),
    },
    {
      name: 'csp-inline-script-hash',
      apply: 'build',
      transformIndexHtml: {
        order: 'post',
        handler(html) {
          const open = html.indexOf('<script>') // the only script tag with no attributes is the inline theme script
          const close = open === -1 ? -1 : html.indexOf('</script>', open)
          if (close !== -1) {
            inlineScriptHash = 'sha256-' + createHash('sha256').update(html.slice(open + '<script>'.length, close)).digest('base64')
          }
          return html
        },
      },
      closeBundle: {
        order: 'post',
        handler() {
          const file = 'dist/.htaccess'
          if (!inlineScriptHash || !existsSync(file)) return
          writeFileSync(file, readFileSync(file, 'utf8').replaceAll('__INLINE_SCRIPT_HASH__', inlineScriptHash))
        },
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: APP_NAME,
        short_name: APP_NAME,
        description: APP_TAGLINE,
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        categories: ['health', 'lifestyle'],
        // Long-press the app icon on Android to jump straight in.
        shortcuts: [
          { name: 'Breathe', url: '/#/breathe', icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }] },
          { name: 'Check in', url: '/#/checkin', icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }] },
        ],
        background_color: THEME_COLOR_LIGHT,
        theme_color: THEME_COLOR_LIGHT,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
})
