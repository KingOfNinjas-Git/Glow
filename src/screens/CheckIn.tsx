import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { MoodHistory, MoodPicker } from '../components/Mood'
import { Button } from '../components/ui/Button'
import { Card, SectionTitle } from '../components/ui/Card'
import { Segmented } from '../components/ui/Controls'
import { moodInfo, type Mood } from '../data/content'
import { formatDayLong, fromDateKey } from '../lib/dates'
import { XP_REWARDS } from '../lib/xp'
import { useApp } from '../state/AppContext'

export function CheckIn() {
  const app = useApp()
  const { data, today } = app
  const existing = data.checkIns[today]
  const [mood, setMood] = useState<Mood | null>(existing?.mood ?? null)
  const [note, setNote] = useState(existing?.note ?? '')
  const [saved, setSaved] = useState(!!existing)
  const [range, setRange] = useState<7 | 14 | 30>(7)
  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMood(data.checkIns[today]?.mood ?? null)
    setNote(data.checkIns[today]?.note ?? '')
    setSaved(!!data.checkIns[today])
  }, [today]) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mood) return
    app.saveCheckIn(mood, note, button.current)
    setSaved(true)
  }

  const recent = Object.values(data.checkIns)
    .filter((c) => c.note)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Check-in</h1>
        <p className="mt-1 text-ink-soft">{formatDayLong(today)} · how are you, really?</p>
      </header>

      <Card>
        <form onSubmit={submit} className="space-y-4">
          <MoodPicker
            value={mood}
            onChange={(m) => {
              setMood(m)
              setSaved(false)
            }}
          />
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-ink-soft">One line about today (optional)</span>
            <input
              value={note}
              maxLength={140}
              onChange={(e) => {
                setNote(e.target.value)
                setSaved(false)
              }}
              placeholder="Slept okay, iced coffee was elite"
              className="h-14 w-full rounded-2xl border border-line bg-surface2 px-4 placeholder:text-ink-soft/70"
            />
          </label>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-ink-soft" role="status">
              {saved && mood ? moodInfo(mood).reply : existing ? 'Update it any time.' : `+${XP_REWARDS.checkin} XP for checking in`}
            </p>
            <Button ref={button} type="submit" disabled={!mood || saved}>
              {saved ? 'Saved ✓' : existing ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <SectionTitle hint={<Segmented label="History range" value={range} onChange={setRange} options={[{ value: 7, label: '7d' }, { value: 14, label: '14d' }, { value: 30, label: '30d' }]} />}>
          Mood history
        </SectionTitle>
        <MoodHistory days={range} checkIns={data.checkIns} today={today} />
      </Card>

      {recent.length > 0 && (
        <Card>
          <SectionTitle>Little notes</SectionTitle>
          <ul className="space-y-2">
            {recent.map((c) => (
              <motion.li key={c.date} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 rounded-2xl bg-surface2 p-3">
                <span className="text-2xl" aria-hidden="true">{moodInfo(c.mood).emoji}</span>
                <div>
                  <p className="text-xs font-bold text-ink-soft">
                    {fromDateKey(c.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                  <p>{c.note}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
