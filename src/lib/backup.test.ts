import { describe, expect, it } from 'vitest'
import { createInitialData, type AppData } from '../state/types'
import { BACKUP_NUDGE_AFTER_DAYS, BACKUP_NUDGE_MIN_XP, describeLastBackup, needsBackupNudge } from './backup'

const now = new Date('2026-10-29T12:00:00Z')
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString()

const person = (over: Partial<AppData> = {}, lastBackupAt?: string): AppData => {
  const base = createInitialData(new Date(daysAgo(40)))
  return { ...base, profile: { ...base.profile, onboarded: true }, xp: 500, settings: { ...base.settings, lastBackupAt }, ...over }
}

describe('when to suggest a backup', () => {
  it('asks when there never was a backup and the data is a few weeks old', () => {
    expect(needsBackupNudge(person(), now)).toBe(true)
  })
  it('asks again once the last backup is old enough, not before', () => {
    expect(needsBackupNudge(person({}, daysAgo(BACKUP_NUDGE_AFTER_DAYS + 1)), now)).toBe(true)
    expect(needsBackupNudge(person({}, daysAgo(BACKUP_NUDGE_AFTER_DAYS - 1)), now)).toBe(false)
  })
  it('leaves someone who has only just started alone', () => {
    expect(needsBackupNudge(person({ xp: BACKUP_NUDGE_MIN_XP - 1 }), now)).toBe(false)
    const fresh = person()
    fresh.profile.createdAt = daysAgo(3)
    expect(needsBackupNudge(fresh, now)).toBe(false)
  })
  it('never nags about the made-up sample data or before onboarding', () => {
    expect(needsBackupNudge(person({ sample: true }), now)).toBe(false)
    const notYet = person()
    notYet.profile.onboarded = false
    expect(needsBackupNudge(notYet, now)).toBe(false)
  })
  it('ignores a broken date instead of nagging forever', () => {
    expect(needsBackupNudge(person({}, 'not a date'), now)).toBe(false)
  })
})

describe('describing the last backup', () => {
  it.each([
    [undefined, 'never'],
    [daysAgo(0), 'today'],
    [daysAgo(1), 'yesterday'],
    [daysAgo(5), '5 days ago'],
    ['garbage', 'today'],
  ])('%s -> %s', (when, text) => {
    expect(describeLastBackup(when, now)).toBe(text)
  })
})
