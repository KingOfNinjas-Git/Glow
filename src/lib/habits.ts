import { fromDateKey, type DateKey } from './dates'

/** Weekdays use JavaScript's numbers: 0 is Sunday ... 6 is Saturday. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const // the week as most of Europe shows it, Monday first

export const weekdayOf = (date: DateKey): number => fromDateKey(date).getDay()

/**
 * The days a habit is meant for, cleaned up: only real weekdays, no duplicates, in order.
 * "Every day" (nothing chosen, or all seven) is stored as `undefined`, so older saves and backups mean the same thing.
 */
export function normalizeDays(days: readonly number[] | undefined | null): number[] | undefined {
  if (!Array.isArray(days)) return undefined
  const clean = [...new Set(days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort((a, b) => WEEK_ORDER.indexOf(a as 0) - WEEK_ORDER.indexOf(b as 0))
  return clean.length === 0 || clean.length === 7 ? undefined : clean
}

/** Is this habit meant for that day? Habits without a schedule are meant for every day. */
export function isDueOn(habit: { days?: number[] }, date: DateKey): boolean {
  const days = normalizeDays(habit.days)
  return !days || days.includes(weekdayOf(date))
}
