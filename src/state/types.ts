import type { Mood } from '../data/content'
import type { PaletteId } from '../data/unlocks'
import type { DateKey } from '../lib/dates'
import type { PresetId } from '../lib/breathing'

export type ThemeMode = 'system' | 'light' | 'dark'

export interface Habit {
  id: string
  emoji: string
  name: string
  createdAt: string
}

export interface CheckIn {
  date: DateKey
  mood: Mood
  note: string
  at: string
}

export interface BreathSession {
  id: string
  date: DateKey
  presetId: PresetId
  seconds: number
  completedAt: string
}

export interface Reminder {
  id: string
  /** 24h "HH:MM" */
  time: string
  enabled: boolean
  /** last day it fired, so it only fires once a day */
  lastFired?: DateKey
}

export interface Settings {
  themeMode: ThemeMode
  palette: PaletteId
  reminders: Reminder[]
  lastReminderMessage?: number
}

export interface AppData {
  schemaVersion: 1
  profile: { name: string; onboarded: boolean; createdAt: string }
  /** total XP ever earned; level is always derived from this */
  xp: number
  habits: Habit[]
  /** day -> ids of habits completed that day */
  completions: Record<DateKey, string[]>
  /** `${date}:habit:${id}` / `${date}:checkin` -> true. Stops un/re-ticking from farming XP. */
  xpClaims: Record<string, true>
  checkIns: Record<DateKey, CheckIn>
  breaths: BreathSession[]
  companion: { name: string }
  settings: Settings
}

export const createInitialData = (now: Date = new Date()): AppData => ({
  schemaVersion: 1,
  profile: { name: '', onboarded: false, createdAt: now.toISOString() },
  xp: 0,
  habits: [],
  completions: {},
  xpClaims: {},
  checkIns: {},
  breaths: [],
  companion: { name: 'Sprout' },
  settings: { themeMode: 'system', palette: 'peach', reminders: [] },
})
