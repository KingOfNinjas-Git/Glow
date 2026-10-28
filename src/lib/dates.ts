export type DateKey = string // local calendar day, YYYY-MM-DD

const pad = (n: number) => String(n).padStart(2, '0')

export const toDateKey = (d: Date = new Date()): DateKey =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const fromDateKey = (key: DateKey): Date => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (key: DateKey, n: number): DateKey => {
  const d = fromDateKey(key)
  d.setDate(d.getDate() + n)
  return toDateKey(d)
}

/** The last `n` days ending at `end`, oldest first. */
export const lastNDays = (n: number, end: DateKey = toDateKey()): DateKey[] =>
  Array.from({ length: n }, (_, i) => addDays(end, i - (n - 1)))

export const monthPrefix = (key: DateKey): string => key.slice(0, 7)

export const daysInMonthOf = (key: DateKey): number => {
  const d = fromDateKey(key)
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

/** Every day of the month containing `key`. */
export const monthDays = (key: DateKey): DateKey[] => {
  const prefix = monthPrefix(key)
  return Array.from({ length: daysInMonthOf(key) }, (_, i) => `${prefix}-${pad(i + 1)}`)
}

export const formatWeekday = (key: DateKey, style: 'short' | 'narrow' = 'short'): string =>
  fromDateKey(key).toLocaleDateString(undefined, { weekday: style })

export const formatDayLong = (key: DateKey): string =>
  fromDateKey(key).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })

export const formatMonthName = (key: DateKey): string =>
  fromDateKey(key).toLocaleDateString(undefined, { month: 'long' })
