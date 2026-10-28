import { useEffect } from 'react'
import { THEME_COLOR_DARK, THEME_COLOR_LIGHT } from '../config/app'
import type { PaletteId } from '../data/unlocks'
import type { ThemeMode } from '../state/types'

/** Applies dark mode + accent palette to <html>, following the OS when mode is "system". */
export function useTheme(mode: ThemeMode, palette: PaletteId): void {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = mode === 'dark' || (mode === 'system' && mq.matches)
      const root = document.documentElement
      root.classList.toggle('dark', dark)
      root.dataset.palette = palette
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? THEME_COLOR_DARK : THEME_COLOR_LIGHT)
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [mode, palette])
}
