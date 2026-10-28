import { describe, expect, it } from 'vitest'
import { addDays, daysInMonthOf, fromDateKey, lastNDays, monthDays, toDateKey } from './dates'

describe('dates', () => {
  it('round-trips keys', () => {
    expect(toDateKey(fromDateKey('2026-03-09'))).toBe('2026-03-09')
  })
  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
  })
  it('lists the last n days oldest first', () => {
    expect(lastNDays(3, '2026-03-01')).toEqual(['2026-02-27', '2026-02-28', '2026-03-01'])
  })
  it('knows month lengths', () => {
    expect(daysInMonthOf('2024-02-10')).toBe(29)
    expect(monthDays('2026-04-15')).toHaveLength(30)
    expect(monthDays('2026-04-15')[0]).toBe('2026-04-01')
  })
})
