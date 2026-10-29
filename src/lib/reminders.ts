import { REMINDER_COUNT } from '../data/content'
import type { DateKey } from './dates'
import type { Reminder } from '../state/types'

/** Pick a message index, never repeating the previous one. `rng` is injectable for tests. */
export function pickMessageIndex(last: number | undefined, rng: () => number = Math.random, size = REMINDER_COUNT): number {
  if (size <= 1) return 0
  let i = Math.floor(rng() * size) % size
  if (i === last) i = (i + 1) % size
  return i
}

export const minutesOf = (time: string): number => {
  const [h, m] = time.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

/** How long after the set time a reminder may still fire. Late ones are skipped, never nagged. */
export const GRACE_MINUTES = 5

/** Reminders that should fire right now: on time (or just after), enabled, and not yet fired today. */
export function dueReminders(reminders: Reminder[], now: Date, today: DateKey): Reminder[] {
  const nowMin = now.getHours() * 60 + now.getMinutes()
  return reminders.filter((r) => {
    if (!r.enabled || r.lastFired === today) return false
    const diff = nowMin - minutesOf(r.time)
    return diff >= 0 && diff <= GRACE_MINUTES
  })
}

export type NotificationSupport = 'unsupported' | 'default' | 'granted' | 'denied'

export const notificationSupport = (): NotificationSupport =>
  typeof Notification === 'undefined' ? 'unsupported' : (Notification.permission as NotificationSupport)
