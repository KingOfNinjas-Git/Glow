export interface HabitSuggestion {
  emoji: string
  name: string
}

export const HABIT_SUGGESTIONS: HabitSuggestion[] = [
  { emoji: '💧', name: 'Drink water' },
  { emoji: '🌤️', name: 'Step outside' },
  { emoji: '🧘', name: 'Stretch' },
  { emoji: '💬', name: 'Text a friend' },
  { emoji: '🍓', name: 'Eat something yummy' },
  { emoji: '🎧', name: 'Play a favorite song' },
  { emoji: '🧺', name: 'Tidy one tiny thing' },
  { emoji: '🌙', name: 'Wind down screens' },
]

export const HABIT_EMOJIS = [
  '💧', '🌤️', '🧘', '💬', '🍓', '🎧', '🧺', '🌙', '📖', '✍️', '🛁', '🥗',
  '🚶', '💊', '🪴', '🐾', '🎨', '🧼', '😴', '☕', '🍵', '🫶', '🌸', '⭐',
]

export type Mood = 1 | 2 | 3 | 4 | 5

export interface MoodInfo {
  value: Mood
  emoji: string
  label: string
  reply: string
}

export const MOODS: MoodInfo[] = [
  { value: 1, emoji: '😣', label: 'Rough', reply: 'Rough days count too. Thanks for checking in, that took care.' },
  { value: 2, emoji: '😕', label: 'Meh', reply: 'Meh is allowed. You showed up, and that matters.' },
  { value: 3, emoji: '😐', label: 'Okay', reply: 'Steady is a fine place to be. Nicely done.' },
  { value: 4, emoji: '🙂', label: 'Good', reply: 'Love that for you. Soak it in a little.' },
  { value: 5, emoji: '🤩', label: 'Great', reply: 'Look at you glowing! Hold on to this one.' },
]

export const moodInfo = (m: Mood): MoodInfo => MOODS[m - 1]

export const REMINDER_MESSAGES: { title: string; body: string }[] = [
  { title: 'Psst 🌿', body: 'Your plant says hi. No pressure, just a soft hello.' },
  { title: 'Tiny win time', body: 'One small thing counts. Pick the easiest one!' },
  { title: 'Hydration station 💧', body: 'Sip sip hooray. Your future self is already grateful.' },
  { title: 'Gentle nudge', body: 'Whenever you are ready, there is a breathing circle with your name on it.' },
  { title: 'Hey you', body: 'How are you actually doing? A 10-second check-in is waiting.' },
  { title: 'Snack o’clock? 🍓', body: 'Feed the human. The plant is fine, it has sunshine.' },
  { title: 'Stretch break', body: 'Your shoulders have left the chat. Bring them back with a stretch.' },
  { title: 'No guilt, only vibes ✨', body: 'Skipped yesterday? Nobody is counting. Today is a fresh page.' },
  { title: 'Quick sky check 🌤️', body: 'Step outside for a minute. Free serotonin, no subscription.' },
  { title: 'Friend alert 💬', body: 'Send one silly text to someone you like. Instant good energy.' },
  { title: 'Soft reset', body: 'Three slow breaths and a shoulder drop. That is the whole assignment.' },
  { title: 'You’re doing fine', body: 'Seriously. Come say hi to your companion when you have a sec.' },
]

export const GREETINGS = {
  morning: ['Good morning', 'Rise and glow', 'Morning'],
  afternoon: ['Hey there', 'Afternoon', 'Hi hi'],
  evening: ['Good evening', 'Hey, night owl', 'Evening'],
} as const

export const COMPANION_LINES = [
  'Thanks for stopping by! 🌱',
  'I am just soaking up the sun ☀️',
  'You are doing better than you think.',
  'Tiny steps still grow big plants.',
  'Water break? I will wait. I am a plant.',
  'Rest counts as growing too.',
  'I believe in you (and so does the sun).',
]
