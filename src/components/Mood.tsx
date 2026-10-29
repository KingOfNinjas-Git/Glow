import { m } from 'framer-motion'
import { MOODS, moodInfo, type Mood } from '../data/content'
import { useI18n } from '../i18n'
import type { MessageKey } from '../i18n/en'
import { formatWeekday, lastNDays, type DateKey } from '../lib/dates'
import type { CheckIn } from '../state/types'

export const moodLabelKey = (value: Mood) => `mood.${value}.label` as MessageKey
export const moodReplyKey = (value: Mood) => `mood.${value}.reply` as MessageKey

export function MoodPicker({ value, onChange }: { value: Mood | null; onChange: (m: Mood) => void }) {
  const { t } = useI18n()
  return (
    <div role="radiogroup" aria-label={t('mood.question')} className="grid grid-cols-5 gap-2 sm:gap-3">
      {MOODS.map((mood) => {
        const active = value === mood.value
        return (
          <m.button
            key={mood.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={t(moodLabelKey(mood.value))}
            onClick={() => onChange(mood.value)}
            whileTap={{ scale: 0.9 }}
            animate={{ scale: active ? 1.08 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className={`flex flex-col items-center gap-1 rounded-3xl border-2 py-3 ${
              active ? 'border-accent-strong bg-accent-soft' : 'border-line bg-surface'
            }`}
          >
            <span className="text-3xl sm:text-4xl" aria-hidden="true">{mood.emoji}</span>
            <span className={`text-xs font-bold ${active ? 'text-accent-strong' : 'text-ink-soft'}`}>{t(moodLabelKey(mood.value))}</span>
          </m.button>
        )
      })}
    </div>
  )
}

/** Soft bar history. Days without a check-in are just quiet, never marked as missed. */
export function MoodHistory({ days, checkIns, today }: { days: number; checkIns: Record<DateKey, CheckIn>; today: DateKey }) {
  const { t, tn, locale } = useI18n()
  const keys = lastNDays(days, today)
  const logged = keys.filter((k) => checkIns[k])
  const dense = days > 14
  return (
    <div>
      <div className="flex h-40 items-end gap-1 sm:gap-1.5" role="list" aria-label={t('mood.history.aria', { days })}>
        {keys.map((k) => {
          const c = checkIns[k]
          const info = c ? moodInfo(c.mood) : null
          const label = info ? t(moodLabelKey(info.value)) : t('mood.history.none')
          return (
            <div
              key={k}
              role="listitem"
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
              title={`${k}: ${label}${c?.note ? ` — ${c.note}` : ''}`}
              aria-label={`${k}: ${label}`}
            >
              {!dense && info && <span className="text-lg" aria-hidden="true">{info.emoji}</span>}
              <m.div
                initial={{ height: 0 }}
                animate={{ height: info ? `${info.value * 16 + 8}%` : '6%' }}
                transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                className="w-full rounded-full"
                style={{ background: info ? `var(--mood-${info.value})` : 'var(--line)', opacity: info ? 1 : 0.6 }}
              />
              {!dense && <span className="text-[10px] font-bold text-ink-soft">{formatWeekday(k, 'narrow', locale)}</span>}
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-sm text-ink-soft">
        {logged.length === 0 ? t('mood.history.empty') : tn('mood.history.count', logged.length, { days })}
      </p>
    </div>
  )
}
