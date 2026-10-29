import { useState } from 'react'
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
  const [hidden, setHidden] = useState(wasHidden)
  if (!data.sample || hidden) return null

  const baseline = 2 // the sample starts with two habits already ticked today
  const items: { label: string; where: string; done: boolean }[] = [
    { label: 'Tick off a tiny habit', where: 'below', done: (data.completions[today]?.length ?? 0) > baseline },
    { label: 'Take a one-minute breath', where: 'Breathe', done: data.breaths.some((b) => b.date === today) },
    { label: 'Check in with your mood', where: 'Check-in', done: !!data.checkIns[today] },
    { label: 'Try a theme', where: 'Settings', done: data.settings.palette !== 'peach' },
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
          Things to try <span className="text-sm font-bold text-ink-soft">({count} of {items.length})</span>
        </h2>
        <button type="button" onClick={hide} className="text-sm font-bold text-accent-strong underline">
          Hide
        </button>
      </div>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {items.map((i) => (
          <li key={i.label} className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm ${i.done ? 'bg-accent-soft text-accent-strong' : 'bg-surface2 text-ink'}`}>
            <span aria-hidden="true">{i.done ? '✅' : '⬜'}</span>
            <span className="font-semibold">
              {i.label}
              <span className="sr-only">{i.done ? ' (done)' : ''}</span>
            </span>
            {!i.done && <span className="ml-auto text-xs text-ink-soft">{i.where}</span>}
          </li>
        ))}
      </ul>
      {count === items.length && <p className="mt-2 text-sm font-bold text-accent-strong">That’s the tour. Peek at Progress to meet your companion at any level ✨</p>}
    </Card>
  )
}
