import { useEffect, useRef } from 'react'
import { APP_NAME } from '../config/app'
import { useI18n } from '../i18n'
import type { MessageKey } from '../i18n/en'
import { toDateKey } from '../lib/dates'
import { dueReminders, notificationSupport, pickMessageIndex } from '../lib/reminders'
import { useApp } from '../state/AppContext'
import { useFx } from '../state/FxContext'

/** Works wherever the app is hosted, not only at the top of a site. */
const ICON = `${import.meta.env.BASE_URL}icon-192.png`

/** Show a system notification (via the service worker when possible), else resolve false. */
export async function showSystemNotification(title: string, body: string): Promise<boolean> {
  if (notificationSupport() !== 'granted') return false
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) {
      await reg.showNotification(title, { body, icon: ICON, badge: ICON, tag: `${APP_NAME.toLowerCase()}-reminder` })
      return true
    }
    new Notification(title, { body, icon: ICON })
    return true
  } catch {
    return false
  }
}

/**
 * Checks once a minute while the app is open or running in the background.
 * Uses a system notification when allowed, otherwise falls back to a soft in-app toast,
 * so denied or unsupported permissions still get a gentle nudge. Late reminders are skipped.
 */
export function useReminderScheduler(): void {
  const app = useApp()
  const fx = useFx()
  const { t } = useI18n()
  const tRef = useRef(t)
  tRef.current = t
  const appRef = useRef(app)
  appRef.current = app
  const fxRef = useRef(fx)
  fxRef.current = fx

  useEffect(() => {
    const tick = async () => {
      const a = appRef.current
      const due = dueReminders(a.data.settings.reminders, new Date(), toDateKey())
      if (!due.length) return
      const idx = pickMessageIndex(a.data.settings.lastReminderMessage)
      const msg = { title: tRef.current(`rem.${idx}.title` as MessageKey), body: tRef.current(`rem.${idx}.body` as MessageKey) }
      for (const r of due) a.markReminderFired(r.id)
      a.updateSettings({ lastReminderMessage: idx })
      const shown = await showSystemNotification(msg.title, msg.body)
      if (!shown || document.visibilityState === 'visible') fxRef.current.toast(msg.title, msg.body)
    }
    tick()
    const id = window.setInterval(tick, 20_000)
    return () => window.clearInterval(id)
  }, [])
}
