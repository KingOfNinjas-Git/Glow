import { describe, expect, it } from 'vitest'
import { checkInClaimKey, habitClaimKey, saveCheckIn, toggleHabit } from '../state/actions'
import { normalize } from '../state/persistence'
import { addDays } from './dates'
import { createSampleData, SAMPLE_DAYS } from './sample'
import { getLevelInfo, XP_REWARDS } from './xp'

const now = new Date(2026, 9, 29, 12, 0)
const today = '2026-10-29'

describe('sample data', () => {
  const sample = createSampleData(now)

  it('is the same every time', () => {
    expect(createSampleData(now)).toEqual(sample)
  })

  it('survives the normal loading step unchanged', () => {
    expect(normalize(JSON.parse(JSON.stringify(sample)))).toEqual(sample)
  })

  it('is marked as sample data and looks like a person who finished onboarding', () => {
    expect(sample.sample).toBe(true)
    expect(sample.profile.onboarded).toBe(true)
    expect(sample.habits.length).toBe(5)
  })

  it('has XP that matches exactly what the rules granted for the history', () => {
    const habitClaims = Object.keys(sample.xpClaims).filter((k) => k.includes(':habit:')).length
    const checkInClaims = Object.keys(sample.xpClaims).filter((k) => k.endsWith(':checkin')).length
    expect(sample.xp).toBe(habitClaims * XP_REWARDS.habit + checkInClaims * XP_REWARDS.checkin + sample.breaths.length * XP_REWARDS.breathing)
  })

  it('lands somewhere with some things unlocked and plenty still to look forward to', () => {
    const { level } = getLevelInfo(sample.xp)
    expect(level).toBeGreaterThanOrEqual(4)
    expect(level).toBeLessThanOrEqual(8)
  })

  it('only refers to habits that exist, and stays inside the last 30 days', () => {
    const ids = new Set(sample.habits.map((h) => h.id))
    const earliest = addDays(today, -SAMPLE_DAYS)
    for (const [date, done] of Object.entries(sample.completions)) {
      expect(date >= earliest && date <= today).toBe(true)
      for (const id of done) expect(ids.has(id)).toBe(true)
    }
    for (const c of Object.values(sample.checkIns)) {
      expect(c.mood).toBeGreaterThanOrEqual(1)
      expect(c.mood).toBeLessThanOrEqual(5)
    }
  })

  it('fills the history: most days have something, a few are quiet, and moods are varied', () => {
    const busyDays = Object.keys(sample.completions).length // includes today
    expect(busyDays).toBeGreaterThanOrEqual(20)
    expect(busyDays).toBeLessThanOrEqual(SAMPLE_DAYS) // at least one quiet day
    expect(Object.keys(sample.checkIns).length).toBeGreaterThanOrEqual(14)
    expect(new Set(Object.values(sample.checkIns).map((c) => c.mood)).size).toBeGreaterThanOrEqual(3)
    expect(sample.breaths.length).toBeGreaterThanOrEqual(5)
  })

  it('leaves today half done so a visitor can still earn XP right away', () => {
    expect(sample.completions[today]).toEqual(['sample-water', 'sample-outside'])
    expect(sample.checkIns[today]).toBeUndefined()
    expect(toggleHabit(sample, 'sample-stretch', today).xp).toBe(XP_REWARDS.habit)
    expect(toggleHabit(sample, 'sample-water', today).xp).toBe(0) // already ticked: un-tick, no XP change
    expect(saveCheckIn(sample, today, 4, 'Trying it out').xp).toBe(XP_REWARDS.checkin)
    expect(habitClaimKey(today, 'sample-water') in sample.xpClaims).toBe(true)
    expect(checkInClaimKey(today) in sample.xpClaims).toBe(false)
  })
})
