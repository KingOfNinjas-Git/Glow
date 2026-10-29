import { useEffect, useState } from 'react'
import { HABIT_EMOJIS } from '../data/content'
import { useI18n } from '../i18n'
import { normalizeDays, WEEK_ORDER } from '../lib/habits'
import type { Habit } from '../state/types'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'

interface Props {
  open: boolean
  /** null = adding a new habit */
  habit: Habit | null
  onClose: () => void
  onSave: (emoji: string, name: string, days?: number[]) => void
  onDelete?: (id: string) => void
}

/** "Mon", "Tue" ... in the language of the app (2026-01-05 is a Monday). */
export const weekdayName = (day: number, locale: string, style: 'short' | 'long' = 'short'): string =>
  new Date(2026, 0, 4 + day).toLocaleDateString(locale, { weekday: style })

export function HabitForm({ open, habit, onClose, onSave, onDelete }: Props) {
  const { t, locale } = useI18n()
  const [emoji, setEmoji] = useState('✨')
  const [name, setName] = useState('')
  const [days, setDays] = useState<number[]>([])
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (open) {
      setEmoji(habit?.emoji ?? '✨')
      setName(habit?.name ?? '')
      setDays(normalizeDays(habit?.days) ?? [])
      setConfirming(false)
    }
  }, [open, habit])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave(emoji, name, normalizeDays(days))
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={habit ? t('form.title.edit') : t('form.title.new')}>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-ink-soft">{t('form.emoji')}</span>
            <input
              value={emoji}
              onChange={(e) => setEmoji(Array.from(e.target.value).slice(-2).join(''))}
              aria-label={t('form.emoji')}
              className="h-14 w-16 rounded-2xl border border-line bg-surface2 text-center text-3xl"
            />
          </label>
          <label className="block flex-1">
            <span className="mb-1 block text-sm font-bold text-ink-soft">{t('form.name')}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder={t('form.placeholder')}
              className="h-14 w-full rounded-2xl border border-line bg-surface2 px-4 text-base placeholder:text-ink-soft/70"
            />
          </label>
        </div>
        <div role="group" aria-label={t('form.pick')} className="grid grid-cols-8 gap-1.5">
          {HABIT_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              aria-label={t('form.use', { emoji: e })}
              aria-pressed={emoji === e}
              className={`flex h-10 items-center justify-center rounded-xl text-xl ${emoji === e ? 'bg-accent-soft ring-2 ring-accent-strong' : 'hover:bg-surface2'}`}
            >
              {e}
            </button>
          ))}
        </div>
        <fieldset className="border-0 p-0">
          <legend className="mb-1 block text-sm font-bold text-ink-soft">{t('form.days')}</legend>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setDays([])}
              aria-pressed={!normalizeDays(days)}
              className={`rounded-full px-3.5 py-2 text-sm font-bold ${!normalizeDays(days) ? 'bg-accent-soft text-accent-strong ring-2 ring-accent-strong' : 'bg-surface2 text-ink-soft hover:bg-accent-soft'}`}
            >
              {t('form.daysAll')}
            </button>
            {WEEK_ORDER.map((d) => {
              const on = days.includes(d)
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(on ? days.filter((x) => x !== d) : [...days, d])}
                  aria-pressed={on}
                  className={`rounded-full px-3.5 py-2 text-sm font-bold ${on ? 'bg-accent-soft text-accent-strong ring-2 ring-accent-strong' : 'bg-surface2 text-ink-soft hover:bg-accent-soft'}`}
                >
                  {weekdayName(d, locale)}
                </button>
              )
            })}
          </div>
          <p className="mt-1.5 text-xs text-ink-soft">{t('form.daysHint')}</p>
        </fieldset>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          {habit && onDelete ? (
            confirming ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-soft">{t('form.removeAsk')}</span>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => {
                    onDelete(habit.id)
                    onClose()
                  }}
                >
                  {t('form.removeYes')}
                </Button>
              </div>
            ) : (
              <Button type="button" variant="ghost" onClick={() => setConfirming(true)}>
                {t('common.delete')}
              </Button>
            )
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {habit ? t('common.save') : t('form.add')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
