import { useEffect } from 'react'

/**
 * Keeps the screen on while `active` is true (a breathing session), so the phone does not lock halfway
 * through. Browsers release the lock when the app is hidden, so it is asked for again on return.
 * Does nothing where the Screen Wake Lock API does not exist.
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false

    const request = async () => {
      try {
        const next = await navigator.wakeLock.request('screen')
        if (cancelled) void next.release()
        else lock = next
      } catch {
        // refused (battery saver, no permission): the session still works, the phone may just dim
      }
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible' && (!lock || lock.released)) void request()
    }

    void request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      void lock?.release()
    }
  }, [active])
}
