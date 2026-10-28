import { motion } from 'framer-motion'
import { MOODS, moodInfo, type Mood } from '../data/content'
import { formatWeekday, lastNDays, type DateKey } from '../lib/dates'
import type { CheckIn } from '../state/types'

export function MoodPicker({ value, onChange }: { value: Mood | null; onChange: (m: Mood) => void }) {
  return (
    <div role="radiogroup" aria-label="How are you feeling?" className="grid grid-cols-5 gap-2 sm:gap-3">
      {MOODS.map((m) => {
        const active = value === m.value
        return (
          <motion.button
            key={m.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={m.label}
            onClick={() => onChange(m.value)}
            whileTap={{ scale: 0.9 }}
            animate={{ scale: active ? 1.08 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className={`flex flex-col items-center gap-1 rounded-3xl border-2 py-3 ${
              active ? 'border-accent-strong bg-accent-soft' : 'border-line bg-surface'
            }`}
          >
            <span className="text-3xl sm:text-4xl" aria-hidden="true">{m.emoji}</span>
            <span className={`text-xs font-bold ${active ? 'text-accent-strong' : 'text-ink-soft'}`}>{m.label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

/** Soft bar history. Days without a check-in are just quiet, never marked as missed. */
export function MoodHistory({ days, checkIns, today }: { days: number; checkIns: Record<DateKey, CheckIn>; today: DateKey }) {
  const keys = lastNDays(days, today)
  const logged = keys.filter((k) => checkIns[k])
  const dense = days > 14
  return (
    <div>
      <div className="flex h-40 items-end gap-1 sm:gap-1.5" role="list" aria-label={`Mood over the last ${days} days`}>
        {keys.map((k) => {
          const c = checkIns[k]
          const info = c ? moodInfo(c.mood) : null
          return (
            <div
              key={k}
              role="listitem"
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
              title={info ? `${k}: ${info.label}${c.note ? ` — ${c.note}` : ''}` : `${k}: no check-in`}
              aria-label={info ? `${k}: ${info.label}` : `${k}: no check-in`}
            >
              {!dense && info && <span className="text-lg" aria-hidden="true">{info.emoji}</span>}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: info ? `${info.value * 16 + 8}%` : '6%' }}
                transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                className="w-full rounded-full"
                style={{ background: info ? `var(--mood-${info.value})` : 'var(--line)', opacity: info ? 1 : 0.6 }}
              />
              {!dense && <span className="text-[10px] font-bold text-ink-soft">{formatWeekday(k, 'narrow')}</span>}
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-sm text-ink-soft">
        {logged.length === 0
          ? 'Your mood story starts with your first check-in.'
          : `${logged.length} check-in${logged.length === 1 ? '' : 's'} in the last ${days} days. Every one is a little act of care.`}
      </p>
    </div>
  )
}
