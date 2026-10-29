import { AnimatePresence } from 'framer-motion'
import { useMemo, useState } from 'react'
import { BackupNudge } from '../components/BackupNudge'
import { Companion } from '../components/Companion'
import { HabitForm } from '../components/HabitForm'
import { HabitRow } from '../components/HabitRow'
import { TryList } from '../components/TryList'
import { XpBar } from '../components/XpBar'
import { Button } from '../components/ui/Button'
import { Card, SectionTitle } from '../components/ui/Card'
import { GREETINGS, HABIT_SUGGESTIONS } from '../data/content'
import { stageForLevel } from '../data/unlocks'
import { activeDaysThisMonth, habitDaysThisMonth } from '../lib/stats'
import { useApp } from '../state/AppContext'
import type { Habit } from '../state/types'

function greeting(name: string): string {
  const h = new Date().getHours()
  const pool = h < 12 ? GREETINGS.morning : h < 18 ? GREETINGS.afternoon : GREETINGS.evening
  const g = pool[new Date().getDate() % pool.length]
  return name ? `${g}, ${name}` : g
}

export function Home() {
  const app = useApp()
  const { data, today, level } = app
  const [editing, setEditing] = useState<Habit | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const doneToday = data.completions[today] ?? []
  const doneCount = data.habits.filter((h) => doneToday.includes(h.id)).length
  const monthDays = activeDaysThisMonth(data, today)
  const ideas = useMemo(
    () => HABIT_SUGGESTIONS.filter((s) => !data.habits.some((h) => h.name.toLowerCase() === s.name.toLowerCase())),
    [data.habits],
  )

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (h: Habit) => {
    setEditing(h)
    setFormOpen(true)
  }

  const summary =
    data.habits.length === 0
      ? 'Pick one tiny thing to start. Tiny is plenty.'
      : doneCount === 0
        ? 'No pressure. Whenever you are ready ✨'
        : doneCount === data.habits.length
          ? 'All done for today. Gold star energy 🌟'
          : `${doneCount} of ${data.habits.length} tiny wins so far. Nice!`

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{greeting(data.profile.name)} 👋</h1>
        <p className="mt-1 text-ink-soft">
          {monthDays > 0 ? `You showed up ${monthDays} ${monthDays === 1 ? 'day' : 'days'} this month. That counts.` : 'A fresh page. No scoreboard, just you.'}
        </p>
      </header>

      <TryList />
      <BackupNudge />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Card className="flex flex-col items-center gap-4 bg-gradient-to-b from-accent-soft to-surface text-center lg:self-start">
          <Companion level={level.level} name={data.companion.name} />
          <div className="-mt-2">
            <p className="text-xl font-extrabold">{data.companion.name}</p>
            <p className="text-sm text-ink-soft">{stageForLevel(level.level).name} · grows as you do</p>
          </div>
          <div className="w-full">
            <XpBar info={level} />
          </div>
        </Card>

        <section aria-labelledby="habits-h">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 id="habits-h" className="text-xl font-extrabold tracking-tight">
                Today’s tiny habits
              </h2>
              <p className="text-sm text-ink-soft">{summary}</p>
            </div>
            <Button variant="soft" onClick={openAdd}>
              + Add
            </Button>
          </div>

          <ul className="space-y-2.5">
            <AnimatePresence initial={false}>
              {data.habits.map((h) => (
                <HabitRow
                  key={h.id}
                  habit={h}
                  done={doneToday.includes(h.id)}
                  daysThisMonth={habitDaysThisMonth(data, h.id, today)}
                  onToggle={(el) => app.toggleHabit(h.id, el)}
                  onEdit={() => openEdit(h)}
                />
              ))}
            </AnimatePresence>
          </ul>

          {ideas.length > 0 && (
            <Card className="mt-5 !p-4">
              <SectionTitle hint="tap to add">Need ideas?</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {ideas.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => app.addHabit(s.emoji, s.name)}
                    className="rounded-full bg-surface2 px-4 py-2 text-sm font-semibold hover:bg-accent-soft"
                  >
                    <span aria-hidden="true">{s.emoji}</span> {s.name}
                  </button>
                ))}
              </div>
            </Card>
          )}
        </section>
      </div>

      <HabitForm
        open={formOpen}
        habit={editing}
        onClose={() => setFormOpen(false)}
        onSave={(emoji, name) => (editing ? app.updateHabit(editing.id, emoji, name) : app.addHabit(emoji, name))}
        onDelete={app.deleteHabit}
      />
    </div>
  )
}
