import type { MessageKey } from '../i18n/en'

/** The words themselves live in src/i18n (one catalogue per language); this file holds what does not change: the emoji and how many there are. */

export interface HabitSuggestion {
  emoji: string
  /** the key of its name in the language catalogues */
  key: MessageKey
}

export const HABIT_SUGGESTIONS: HabitSuggestion[] = [
  { emoji: '💧', key: 'habit.water' },
  { emoji: '🌤️', key: 'habit.outside' },
  { emoji: '🧘', key: 'habit.stretch' },
  { emoji: '💬', key: 'habit.friend' },
  { emoji: '🍓', key: 'habit.treat' },
  { emoji: '🎧', key: 'habit.song' },
  { emoji: '🧺', key: 'habit.tidy' },
  { emoji: '🌙', key: 'habit.screens' },
]

export const HABIT_EMOJIS = [
  '💧', '🌤️', '🧘', '💬', '🍓', '🎧', '🧺', '🌙', '📖', '✍️', '🛁', '🥗',
  '🚶', '💊', '🪴', '🐾', '🎨', '🧼', '😴', '☕', '🍵', '🫶', '🌸', '⭐',
]

export type Mood = 1 | 2 | 3 | 4 | 5

export interface MoodInfo {
  value: Mood
  emoji: string
}

/** The names and the kind replies are in the catalogues: mood.<value>.label and mood.<value>.reply. */
export const MOODS: MoodInfo[] = [
  { value: 1, emoji: '😣' },
  { value: 2, emoji: '😕' },
  { value: 3, emoji: '😐' },
  { value: 4, emoji: '🙂' },
  { value: 5, emoji: '🤩' },
]

export const moodInfo = (m: Mood): MoodInfo => MOODS[m - 1]

/** How many reminder messages (rem.0 to rem.11), greetings per time of day, and companion lines exist in each language. */
export const REMINDER_COUNT = 12
export const GREETING_COUNT = 3
export const COMPANION_LINE_COUNT = 7
