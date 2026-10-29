import { describe, expect, it } from 'vitest'
import { isDueOn, normalizeDays, weekdayOf } from './habits'

describe('weekdays for habits', () => {
  it('knows which weekday a date is (0 = Sunday)', () => {
    expect(weekdayOf('2026-10-26')).toBe(1) // a Monday
    expect(weekdayOf('2026-10-25')).toBe(0) // a Sunday
    expect(weekdayOf('2026-10-31')).toBe(6) // a Saturday
  })

  it('treats nothing chosen, an empty list and all seven days as "every day"', () => {
    expect(normalizeDays(undefined)).toBeUndefined()
    expect(normalizeDays([])).toBeUndefined()
    expect(normalizeDays([0, 1, 2, 3, 4, 5, 6])).toBeUndefined()
  })

  it('cleans a list: real weekdays only, no duplicates, Monday first', () => {
    expect(normalizeDays([0, 5, 1, 1, 9, -1, 2.5])).toEqual([1, 5, 0])
    expect(normalizeDays(['1', 3] as unknown as number[])).toEqual([3])
    expect(normalizeDays('mon' as unknown as number[])).toBeUndefined()
  })

  it('says whether a habit is meant for a day', () => {
    const weekdays = { days: [1, 2, 3, 4, 5] }
    expect(isDueOn(weekdays, '2026-10-26')).toBe(true) // Monday
    expect(isDueOn(weekdays, '2026-10-31')).toBe(false) // Saturday
    expect(isDueOn(weekdays, '2026-10-25')).toBe(false) // Sunday
    expect(isDueOn({}, '2026-10-25')).toBe(true) // no schedule: every day
    expect(isDueOn({ days: [] }, '2026-10-25')).toBe(true)
  })
})
