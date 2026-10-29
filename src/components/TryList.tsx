import { useState } from 'react'
import { useI18n } from '../i18n'
import type { MessageKey } from '../i18n/en'
import { useApp } from '../state/AppContext'
import { Card } from './ui/Card'

const KEY = 'glow:try-list-hidden'

const wasHidden = () => {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

/**
 * A short "things to try" list for visitors exploring the sample data. Each line ticks itself off from what
 * they actually do, so there is nothing to manage. It only exists while the sample data is loaded.
 */
export function TryList() {
  const { data, today } = useApp()
  const { t } = useI18n()
  const [hidden, setHidden] = useState(wasHidden)
  if (!data.sample || hidden) return null

  const baseline = 2 // the sample starts with two habits already ticked today
  const items: { label: MessageKey; where: MessageKey; done: boolean }[] = [
    { label: 'try.habit', where: 'try.below', done: (data.completions[today]?.length ?? 0) > baseline },
    { label: 'try.breath', where: 'nav.breathe', done: data.breaths.some((b) => b.date === today) },
    { label: 'try.checkin', where: 'nav.checkin', done: !!data.checkIns[today] },
    { label: 'try.theme', where: 'nav.settings', done: data.settings.palette !== 'peach' },
  ]
  const count = items.filter((i) => i.done).length

  const hide = () => {
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      /* nothing to remember it with: it simply shows again next visit */
    }
    setHidden(true)
  }

  return (
    <Card role="region" className="!p-4 sm:!p-5" aria-labelledby="try-title">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 id="try-title" className="text-lg font-extrabold tracking-tight">
          {t('try.title')} <span className="text-sm font-bold text-ink-soft">{t('try.count', { count, total: items.length })}</span>
        </h2>
        <button type="button" onClick={hide} className="text-sm font-bold text-accent-strong underline">
          {t('try.hide')}
        </button>
      </div>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {items.map((i) => (
          <li key={i.label} className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm ${i.done ? 'bg-accent-soft text-accent-strong' : 'bg-surface2 text-ink'}`}>
            <span aria-hidden="true">{i.done ? '✅' : '⬜'}</span>
            <span className="font-semibold">
              {t(i.label)}
              <span className="sr-only">{i.done ? t('try.doneSr') : ''}</span>
            </span>
            {!i.done && <span className="ml-auto text-xs text-ink-soft">{t(i.where)}</span>}
          </li>
        ))}
      </ul>
      {count === items.length && <p className="mt-2 text-sm font-bold text-accent-strong">{t('try.complete')}</p>}
    </Card>
  )
}
