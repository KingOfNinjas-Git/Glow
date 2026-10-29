import { XP_REWARDS } from '../lib/xp'
import type { Mood } from '../data/content'
import type { DateKey } from '../lib/dates'
import type { PresetId } from '../lib/breathing'
import { normalizeDays } from '../lib/habits'
import type { AppData, Habit, Reminder, Settings } from './types'

/** Every action is pure: (state, input) -> new state plus the XP it granted (0 if none). */
export interface ActionResult {
  state: AppData
  xp: number
}

const none = (state: AppData): ActionResult => ({ state, xp: 0 })

export const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

const withXp = (state: AppData, amount: number): AppData => ({ ...state, xp: state.xp + amount })

export const habitClaimKey = (date: DateKey, id: string) => `${date}:habit:${id}`
export const checkInClaimKey = (date: DateKey) => `${date}:checkin`

export function addHabit(state: AppData, emoji: string, name: string, now = new Date(), days?: number[]): AppData {
  const trimmed = name.trim()
  if (!trimmed) return state
  const habit: Habit = { id: newId(), emoji: emoji || '✨', name: trimmed.slice(0, 40), createdAt: now.toISOString() }
  const schedule = normalizeDays(days)
  if (schedule) habit.days = schedule
  return { ...state, habits: [...state.habits, habit] }
}

/** Changes a habit. `days` replaces its schedule (leave it out, or send every day, for a habit that is meant for every day). */
export function updateHabit(state: AppData, id: string, emoji: string, name: string, days?: number[]): AppData {
  const trimmed = name.trim()
  if (!trimmed) return state
  return {
    ...state,
    habits: state.habits.map((h) => {
      if (h.id !== id) return h
      const { days: _old, ...rest } = h
      const schedule = normalizeDays(days)
      return { ...rest, emoji: emoji || h.emoji, name: trimmed.slice(0, 40), ...(schedule ? { days: schedule } : {}) }
    }),
  }
}

/** Past completions are kept (history stays), the habit just stops showing up. */
export function deleteHabit(state: AppData, id: string): AppData {
  return { ...state, habits: state.habits.filter((h) => h.id !== id) }
}

/** Tick or untick a habit. XP is granted once per habit per day, ever. Unticking never takes XP away. */
export function toggleHabit(state: AppData, id: string, date: DateKey): ActionResult {
  const done = state.completions[date] ?? []
  if (done.includes(id)) {
    return none({ ...state, completions: { ...state.completions, [date]: done.filter((x) => x !== id) } })
  }
  const key = habitClaimKey(date, id)
  const next: AppData = { ...state, completions: { ...state.completions, [date]: [...done, id] } }
  if (state.xpClaims[key]) return none(next)
  return {
    state: withXp({ ...next, xpClaims: { ...state.xpClaims, [key]: true } }, XP_REWARDS.habit),
    xp: XP_REWARDS.habit,
  }
}

/** One check-in per day; editing it later is fine but only the first earns XP. */
export function saveCheckIn(state: AppData, date: DateKey, mood: Mood, note: string, now = new Date()): ActionResult {
  const next: AppData = {
    ...state,
    checkIns: { ...state.checkIns, [date]: { date, mood, note: note.trim().slice(0, 140), at: now.toISOString() } },
  }
  const key = checkInClaimKey(date)
  if (state.xpClaims[key]) return none(next)
  return {
    state: withXp({ ...next, xpClaims: { ...state.xpClaims, [key]: true } }, XP_REWARDS.checkin),
    xp: XP_REWARDS.checkin,
  }
}

export function completeBreathing(
  state: AppData,
  date: DateKey,
  presetId: PresetId,
  seconds: number,
  now = new Date(),
): ActionResult {
  return {
    state: withXp(
      { ...state, breaths: [...state.breaths, { id: newId(), date, presetId, seconds, completedAt: now.toISOString() }] },
      XP_REWARDS.breathing,
    ),
    xp: XP_REWARDS.breathing,
  }
}

export function finishOnboarding(state: AppData, name: string, habits: { emoji: string; name: string }[]): AppData {
  let next: AppData = { ...state, profile: { ...state.profile, name: name.trim().slice(0, 24), onboarded: true } }
  for (const h of habits) next = addHabit(next, h.emoji, h.name)
  return next
}

export const setCompanionName = (state: AppData, name: string): AppData => ({
  ...state,
  companion: { name: name.trim().slice(0, 16) || 'Sprout' },
})

export const setProfileName = (state: AppData, name: string): AppData => ({
  ...state,
  profile: { ...state.profile, name: name.slice(0, 24) },
})

export const updateSettings = (state: AppData, patch: Partial<Settings>): AppData => ({
  ...state,
  settings: { ...state.settings, ...patch },
})

export function addReminder(state: AppData, time: string): AppData {
  const reminder: Reminder = { id: newId(), time, enabled: true }
  return updateSettings(state, { reminders: [...state.settings.reminders, reminder] })
}

export const updateReminder = (state: AppData, id: string, patch: Partial<Reminder>): AppData =>
  updateSettings(state, { reminders: state.settings.reminders.map((r) => (r.id === id ? { ...r, ...patch } : r)) })

export const removeReminder = (state: AppData, id: string): AppData =>
  updateSettings(state, { reminders: state.settings.reminders.filter((r) => r.id !== id) })
