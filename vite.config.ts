import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { APP_NAME, APP_TAGLINE, STORAGE_KEY, THEME_COLOR_LIGHT } from './src/config/app.ts'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'inject-app-config',
      transformIndexHtml: (html) =>
        html
          .replaceAll('__APP_NAME__', APP_NAME)
          .replaceAll('__APP_TAGLINE__', APP_TAGLINE)
          .replaceAll('__STORAGE_KEY__', STORAGE_KEY),
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: APP_NAME,
        short_name: APP_NAME,
        description: APP_TAGLINE,
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
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
