import type { DateKey } from './dates'
import { monthPrefix } from './dates'
import type { AppData } from '../state/types'

/** Distinct days in the month of `today` with at least one habit done. Gentle stat, never a streak. */
export function activeDaysThisMonth(data: AppData, today: DateKey): number {
  const prefix = monthPrefix(today)
  return Object.entries(data.completions).filter(([d, ids]) => d.startsWith(prefix) && ids.length > 0).length
}

export function habitDaysThisMonth(data: AppData, habitId: string, today: DateKey): number {
  const prefix = monthPrefix(today)
  return Object.entries(data.completions).filter(([d, ids]) => d.startsWith(prefix) && ids.includes(habitId)).length
}

export function totalHabitCompletions(data: AppData): number {
  return Object.values(data.completions).reduce((n, ids) => n + ids.length, 0)
}

export function breathingMinutes(data: AppData): number {
  return Math.round(data.breaths.reduce((s, b) => s + b.seconds, 0) / 60)
}

export function breathsThisMonth(data: AppData, today: DateKey): number {
  const prefix = monthPrefix(today)
  return data.breaths.filter((b) => b.date.startsWith(prefix)).length
}

export function checkInsThisMonth(data: AppData, today: DateKey): number {
  const prefix = monthPrefix(today)
  return Object.keys(data.checkIns).filter((d) => d.startsWith(prefix)).length
}

/** Days this month where anything at all (habit, breath, check-in) happened. */
export function showedUpDays(data: AppData, today: DateKey): Set<DateKey> {
  const prefix = monthPrefix(today)
  const days = new Set<DateKey>()
  for (const [d, ids] of Object.entries(data.completions)) if (d.startsWith(prefix) && ids.length) days.add(d)
  for (const d of Object.keys(data.checkIns)) if (d.startsWith(prefix)) days.add(d)
  for (const b of data.breaths) if (b.date.startsWith(prefix)) days.add(b.date)
  return days
}
