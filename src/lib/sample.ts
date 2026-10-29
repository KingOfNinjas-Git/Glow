import type { Mood } from '../data/content'
import { en } from '../i18n/en'
import type { MessageKey } from '../i18n/en'
import { checkInClaimKey, habitClaimKey } from '../state/actions'
import type { AppData, BreathSession, CheckIn, Habit } from '../state/types'
import { PRESETS } from './breathing'
import { addDays, toDateKey, type DateKey } from './dates'
import { XP_REWARDS } from './xp'

/** How many days of made-up history the sample holds (not counting today). */
export const SAMPLE_DAYS = 30

/** Small seeded random numbers, so the sample looks the same every time it is made. */
function seeded(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SAMPLE_HABITS: { id: string; emoji: string; key: MessageKey; chance: number }[] = [
  { id: 'sample-water', emoji: '💧', key: 'habit.water', chance: 0.85 },
  { id: 'sample-outside', emoji: '🌤️', key: 'habit.outside', chance: 0.6 },
  { id: 'sample-stretch', emoji: '🧘', key: 'habit.stretch', chance: 0.55 },
  { id: 'sample-friend', emoji: '💬', key: 'habit.friend', chance: 0.4 },
  { id: 'sample-screens', emoji: '🌙', key: 'habit.screens', chance: 0.5 },
]

const SAMPLE_NOTE_COUNT = 8

/** Gives the words of the sample (habit names, little notes) in a language. English unless told otherwise. */
export type SampleText = (key: MessageKey) => string

/**
 * Thirty days of believable made-up history (habits, check-ins, breathing) with a few things done today,
 * so every screen has something to show. XP is exactly what the real rules would have granted, so
 * ticking, un-ticking and checking in behave like they do for anyone else.
 */
export function createSampleData(now: Date = new Date(), text: SampleText = (key) => en[key]): AppData {
  const rng = seeded(2026)
  const today = toDateKey(now)
  const habits: Habit[] = SAMPLE_HABITS.map((h) => ({
    id: h.id,
    emoji: h.emoji,
    name: text(h.key),
    createdAt: addDays(today, -SAMPLE_DAYS) + 'T09:00:00.000Z',
  }))

  const completions: AppData['completions'] = {}
  const xpClaims: AppData['xpClaims'] = {}
  const checkIns: Record<DateKey, CheckIn> = {}
  const breaths: BreathSession[] = []
  let xp = 0

  for (let back = SAMPLE_DAYS; back >= 1; back--) {
    const date = addDays(today, -back)
    if (rng() < 0.2) continue // a quiet day: nothing at all, and that is fine
    // a gentle upward drift: later days are a little more likely to be busy
    const energy = 0.85 + ((SAMPLE_DAYS - back) / SAMPLE_DAYS) * 0.3
    const done = SAMPLE_HABITS.filter((h) => rng() < h.chance * energy).map((h) => h.id)
    if (done.length) {
      completions[date] = done
      for (const id of done) {
        xpClaims[habitClaimKey(date, id)] = true
        xp += XP_REWARDS.habit
      }
    }

    if (rng() < 0.75) {
      // mostly okay-to-good, with the odd rough day, and a slow rise over the month
      const base = 3 + (SAMPLE_DAYS - back) / SAMPLE_DAYS
      const mood = Math.max(1, Math.min(5, Math.round(base + (rng() - 0.55) * 2.6))) as Mood
      checkIns[date] = {
        date,
        mood,
        note: rng() < 0.4 ? text(`sample.note.${Math.floor(rng() * SAMPLE_NOTE_COUNT)}` as MessageKey) : '',
        at: `${date}T20:00:00.000Z`,
      }
      xpClaims[checkInClaimKey(date)] = true
      xp += XP_REWARDS.checkin
    }

    if (rng() < 0.35) {
      const seconds = [60, 120, 180][Math.floor(rng() * 3)]
      breaths.push({
        id: `sample-breath-${breaths.length + 1}`,
        date,
        presetId: PRESETS[Math.floor(rng() * PRESETS.length)].id,
        seconds,
        completedAt: `${date}T18:00:00.000Z`,
      })
      xp += XP_REWARDS.breathing
    }
  }

  // Today is half done: water and a walk are ticked, the rest is left for the visitor to try.
  const doneToday = ['sample-water', 'sample-outside']
  completions[today] = doneToday
  for (const id of doneToday) {
    xpClaims[habitClaimKey(today, id)] = true
    xp += XP_REWARDS.habit
  }

  return {
    schemaVersion: 1,
    sample: true,
    profile: { name: 'Alex', onboarded: true, createdAt: `${addDays(today, -SAMPLE_DAYS)}T09:00:00.000Z` },
    xp,
    habits,
    completions,
    xpClaims,
    checkIns,
    breaths,
    companion: { name: 'Sprout' },
    settings: { themeMode: 'system', palette: 'peach', reminders: [], haptics: true },
  }
}
