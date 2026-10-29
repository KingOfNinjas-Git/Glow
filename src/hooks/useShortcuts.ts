import { useEffect } from 'react'
import { ROUTES, type Route } from './useHashRoute'

/** On a keyboard: 1 to 5 jump between screens. Never fires while typing or when a dialog is open. */
export function useShortcuts(go: (route: Route) => void): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return
      const target = e.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]')) return
      if (document.querySelector('[role="dialog"]')) return
      const index = Number(e.key) - 1
      if (Number.isInteger(index) && index >= 0 && index < ROUTES.length) {
        e.preventDefault()
        go(ROUTES[index])
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [go])
}
