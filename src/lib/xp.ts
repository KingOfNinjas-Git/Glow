export const XP_REWARDS = { habit: 10, breathing: 15, checkin: 10 } as const
export type XpSource = keyof typeof XP_REWARDS

/** XP needed to climb from `level` to `level + 1`. Grows gently: 40, 105, 185, 280, ... */
export function xpToNextLevel(level: number): number {
  const l = Math.max(1, Math.floor(level) || 1)
  return Math.round((40 * Math.pow(l, 1.4)) / 5) * 5
}

/** Total XP at which `level` begins (level 1 begins at 0). */
export function totalXpForLevel(level: number): number {
  let total = 0
  for (let l = 1; l < level; l++) total += xpToNextLevel(l)
  return total
}

export interface LevelInfo {
  level: number
  totalXp: number
  xpIntoLevel: number
  xpForLevel: number
  xpToGo: number
  /** 0..1 progress through the current level */
  progress: number
}

export function getLevelInfo(totalXp: number): LevelInfo {
  const total = Number.isFinite(totalXp) ? Math.max(0, Math.floor(totalXp)) : 0
  let level = 1
  let remaining = total
  while (remaining >= xpToNextLevel(level)) {
    remaining -= xpToNextLevel(level)
    level++
  }
  const xpForLevel = xpToNextLevel(level)
  return {
    level,
    totalXp: total,
    xpIntoLevel: remaining,
    xpForLevel,
    xpToGo: xpForLevel - remaining,
    progress: remaining / xpForLevel,
  }
}

export interface XpGain {
  amount: number
  before: LevelInfo
  after: LevelInfo
  /** Every level reached by this gain, in order (empty if none). */
  levelsGained: number[]
}

export function applyXp(totalXp: number, amount: number): XpGain {
  const amt = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0
  const before = getLevelInfo(totalXp)
  const after = getLevelInfo(before.totalXp + amt)
  const levelsGained: number[] = []
  for (let l = before.level + 1; l <= after.level; l++) levelsGained.push(l)
  return { amount: amt, before, after, levelsGained }
}
