import { describe, expect, it } from 'vitest'
import { XP_REWARDS, applyXp, getLevelInfo, totalXpForLevel, xpToNextLevel } from './xp'

describe('rewards', () => {
  it('matches the spec', () => {
    expect(XP_REWARDS).toEqual({ habit: 10, breathing: 15, checkin: 10 })
  })
})

describe('xpToNextLevel', () => {
  it('gets gradually harder', () => {
    for (let l = 1; l < 60; l++) expect(xpToNextLevel(l + 1)).toBeGreaterThan(xpToNextLevel(l))
  })
  it('keeps early levels friendly', () => {
    expect(xpToNextLevel(1)).toBeLessThanOrEqual(50)
  })
  it('is safe on bad input', () => {
    expect(xpToNextLevel(0)).toBe(xpToNextLevel(1))
    expect(xpToNextLevel(NaN)).toBe(xpToNextLevel(1))
  })
})

describe('getLevelInfo', () => {
  it('starts at level 1 with no progress', () => {
    expect(getLevelInfo(0)).toMatchObject({ level: 1, xpIntoLevel: 0, progress: 0 })
  })
  it('levels up exactly at the boundary', () => {
    const need = xpToNextLevel(1)
    expect(getLevelInfo(need - 1).level).toBe(1)
    expect(getLevelInfo(need).level).toBe(2)
    expect(getLevelInfo(need).xpIntoLevel).toBe(0)
  })
  it('agrees with totalXpForLevel', () => {
    for (let l = 1; l < 25; l++) {
      expect(getLevelInfo(totalXpForLevel(l)).level).toBe(l)
      expect(getLevelInfo(totalXpForLevel(l + 1) - 1).level).toBe(l)
    }
  })
  it('reports xpToGo and progress', () => {
    const info = getLevelInfo(10)
    expect(info.xpToGo + info.xpIntoLevel).toBe(info.xpForLevel)
    expect(info.progress).toBeCloseTo(10 / xpToNextLevel(1))
  })
  it('handles negatives and NaN', () => {
    expect(getLevelInfo(-5).totalXp).toBe(0)
    expect(getLevelInfo(NaN).level).toBe(1)
  })
})

describe('applyXp', () => {
  it('adds xp without levelling', () => {
    const g = applyXp(0, 10)
    expect(g.after.totalXp).toBe(10)
    expect(g.levelsGained).toEqual([])
  })
  it('reports a level-up', () => {
    const g = applyXp(xpToNextLevel(1) - 5, 10)
    expect(g.levelsGained).toEqual([2])
  })
  it('reports multiple levels in one gain', () => {
    const g = applyXp(0, totalXpForLevel(4))
    expect(g.levelsGained).toEqual([2, 3, 4])
  })
  it('ignores negative or invalid amounts', () => {
    expect(applyXp(50, -10).after.totalXp).toBe(50)
    expect(applyXp(50, NaN).after.totalXp).toBe(50)
  })
})
