import { useEffect } from 'react'

/**
 * Once someone has set the app up, ask the browser not to clear its saved data when it is short on space.
 * Browsers decide for themselves (often yes for installed or frequently used sites) and it never shows a prompt
 * that matters, so there is nothing to handle if it says no.
 */
export function usePersistentStorage(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return
    void navigator.storage?.persist?.().catch(() => undefined)
  }, [enabled])
}
