import { describe, expect, it } from 'vitest'
import { addHabit, completeBreathing, deleteHabit, saveCheckIn, toggleHabit, updateHabit } from './actions'
import { createInitialData } from './types'
import { normalize } from './persistence'
import { activeDaysThisMonth } from '../lib/stats'
import { dueReminders, pickMessageIndex } from '../lib/reminders'

const day = '2026-03-10'

describe('habits and XP', () => {
  const withHabit = addHabit(createInitialData(), '💧', 'Drink water')
  const id = withHabit.habits[0].id

  it('awards 10 XP for a first completion', () => {
    const r = toggleHabit(withHabit, id, day)
    expect(r.xp).toBe(10)
    expect(r.state.xp).toBe(10)
    expect(r.state.completions[day]).toEqual([id])
  })
  it('does not re-award XP after untick and retick, and never removes it', () => {
    const a = toggleHabit(withHabit, id, day)
    const b = toggleHabit(a.state, id, day)
    expect(b.xp).toBe(0)
    expect(b.state.xp).toBe(10)
    const c = toggleHabit(b.state, id, day)
    expect(c.xp).toBe(0)
    expect(c.state.xp).toBe(10)
  })
  it('awards again on a new day', () => {
    const a = toggleHabit(withHabit, id, day)
    expect(toggleHabit(a.state, id, '2026-03-11').xp).toBe(10)
  })
  it('ignores empty names and keeps history on delete', () => {
    expect(addHabit(withHabit, '✨', '   ').habits).toHaveLength(1)
    const a = toggleHabit(withHabit, id, day)
    const d = deleteHabit(a.state, id)
    expect(d.habits).toHaveLength(0)
    expect(d.completions[day]).toEqual([id])
  })
})

describe('check-in and breathing', () => {
  it('awards check-in XP once per day', () => {
    const a = saveCheckIn(createInitialData(), day, 4, 'ok')
    expect(a.xp).toBe(10)
    const b = saveCheckIn(a.state, day, 2, 'edited')
    expect(b.xp).toBe(0)
    expect(b.state.checkIns[day].mood).toBe(2)
  })
  it('awards 15 XP per breathing session', () => {
    const a = completeBreathing(createInitialData(), day, 'box', 60)
    expect(a.xp).toBe(15)
    expect(a.state.breaths).toHaveLength(1)
  })
})

describe('stats', () => {
  it('counts distinct active days this month', () => {
    let s = addHabit(createInitialData(), '💧', 'Water')
    const id = s.habits[0].id
    s = toggleHabit(s, id, '2026-03-01').state
    s = toggleHabit(s, id, '2026-03-02').state
    s = toggleHabit(s, id, '2026-02-28').state
    expect(activeDaysThisMonth(s, day)).toBe(2)
  })
})

describe('persistence normalize', () => {
  it('survives garbage and partial data', () => {
    expect(normalize(null).habits).toEqual([])
    expect(normalize({ xp: 'x' as unknown as number }).xp).toBe(0)
    expect(normalize({ profile: { name: 'A' } as never }).profile.onboarded).toBe(false)
  })
})

describe('reminders', () => {
  const r = { id: '1', time: '09:00', enabled: true }
  it('fires on time and shortly after, not later, not twice', () => {
    expect(dueReminders([r], new Date(2026, 2, 10, 9, 0), day)).toHaveLength(1)
    expect(dueReminders([r], new Date(2026, 2, 10, 9, 4), day)).toHaveLength(1)
    expect(dueReminders([r], new Date(2026, 2, 10, 9, 30), day)).toHaveLength(0)
    expect(dueReminders([r], new Date(2026, 2, 10, 8, 59), day)).toHaveLength(0)
    expect(dueReminders([{ ...r, lastFired: day }], new Date(2026, 2, 10, 9, 0), day)).toHaveLength(0)
    expect(dueReminders([{ ...r, enabled: false }], new Date(2026, 2, 10, 9, 0), day)).toHaveLength(0)
  })
  it('never repeats the previous message', () => {
    for (let i = 0; i < 12; i++) expect(pickMessageIndex(i, () => i / 12, 12)).not.toBe(i)
  })
})

describe('habits with their own weekdays', () => {
  it('stores a schedule, cleaned up, and nothing for "every day"', () => {
    const base = createInitialData()
    expect(addHabit(base, '🧘', 'Stretch', new Date(), [5, 1, 1, 9]).habits[0].days).toEqual([1, 5])
    expect('days' in addHabit(base, '🧘', 'Stretch', new Date(), [0, 1, 2, 3, 4, 5, 6]).habits[0]).toBe(false)
    expect('days' in addHabit(base, '🧘', 'Stretch').habits[0]).toBe(false)
  })

  it('changes and removes a schedule when a habit is edited, keeping everything else', () => {
    const one = addHabit(createInitialData(), '🧘', 'Stretch', new Date(), [1, 3])
    const id = one.habits[0].id
    const changed = updateHabit(one, id, '🧘', 'Stretch more', [6, 0])
    expect(changed.habits[0]).toMatchObject({ id, name: 'Stretch more', days: [6, 0] })
    const everyDay = updateHabit(changed, id, '🧘', 'Stretch more')
    expect('days' in everyDay.habits[0]).toBe(false)
    expect(everyDay.habits[0].createdAt).toBe(one.habits[0].createdAt)
  })

  it('still gives XP for a habit ticked on a day it is not meant for (no scolding, no locks)', () => {
    const one = addHabit(createInitialData(), '🧘', 'Stretch', new Date(), [1]) // Mondays
    const r = toggleHabit(one, one.habits[0].id, '2026-10-31') // a Saturday
    expect(r.xp).toBe(10)
  })
})
