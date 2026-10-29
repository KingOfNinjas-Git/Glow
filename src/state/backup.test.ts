import { describe, expect, it } from 'vitest'
import { advanceElapsed, phaseAt, getPreset } from '../lib/breathing'
import { addHabit, toggleHabit } from './actions'
import { MAX_BACKUP_BYTES, parseBackup } from './persistence'
import { createInitialData } from './types'

describe('restoring a backup', () => {
  const real = toggleHabit(addHabit({ ...createInitialData(), profile: { ...createInitialData().profile, onboarded: true } }, '💧', 'Drink water'), 'x', '2026-03-10').state

  it('accepts a backup made by the app and gives back the same data', () => {
    const result = parseBackup(JSON.stringify(real))
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.habits).toEqual(real.habits)
      expect(result.data.xp).toBe(real.xp)
    }
  })

  it('fills in settings an older backup does not have', () => {
    const old = JSON.parse(JSON.stringify(real))
    delete old.settings.haptics
    const result = parseBackup(JSON.stringify(old))
    expect(result.ok && result.data.settings.haptics).toBe(true)
  })

  it('never sends someone back to the welcome screen', () => {
    const fresh = { ...real, profile: { ...real.profile, onboarded: false } }
    const result = parseBackup(JSON.stringify(fresh))
    expect(result.ok && result.data.profile.onboarded).toBe(true)
  })

  it.each([
    ['text that is not JSON', 'hello there'],
    ['a list', '[1,2,3]'],
    ['null', 'null'],
    ['an object that is not a backup', '{"name":"someone else’s file"}'],
    ['a backup with the wrong kinds of values', '{"xp":"lots","habits":"none","profile":1,"completions":{}}'],
  ])('refuses %s with a friendly message and no data', (_label, text) => {
    const result = parseBackup(text)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.length).toBeGreaterThan(5)
  })

  it('refuses a file that is far too big', () => {
    expect(parseBackup(' '.repeat(MAX_BACKUP_BYTES + 1)).ok).toBe(false)
  })

  it('keeps XP and history that are in the file, and ignores negative or invalid XP', () => {
    const odd = { ...real, xp: -50 }
    const result = parseBackup(JSON.stringify(odd))
    expect(result.ok && result.data.xp).toBe(0)
  })
})

describe('a breathing session while the screen is locked', () => {
  it('counts a normal frame in full', () => {
    expect(advanceElapsed(1000, 16)).toBe(1016)
  })
  it('counts a huge gap (screen locked for a minute) as one short step, so the session pauses', () => {
    expect(advanceElapsed(1000, 60_000)).toBe(1250)
  })
  it('never goes backwards', () => {
    expect(advanceElapsed(1000, -5)).toBe(1000)
  })
  it('keeps the circle in the same phase while paused', () => {
    const calm = getPreset('calm')
    const before = phaseAt(calm, 3000)
    const afterLock = phaseAt(calm, advanceElapsed(3000, 120_000))
    expect(afterLock.index).toBe(before.index)
  })
})
