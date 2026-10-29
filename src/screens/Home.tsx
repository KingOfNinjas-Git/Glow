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
import { GREETING_COUNT, HABIT_SUGGESTIONS } from '../data/content'
import { stageForLevel } from '../data/unlocks'
import { allTranslations, useI18n } from '../i18n'
import type { MessageKey } from '../i18n/en'
import { activeDaysThisMonth, habitDaysThisMonth } from '../lib/stats'
import { useApp } from '../state/AppContext'
import type { Habit } from '../state/types'

/** A greeting for the time of day; the one shown changes from day to day. */
function greetingKey(): MessageKey {
  const h = new Date().getHours()
  const part = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
  return `greeting.${part}.${new Date().getDate() % GREETING_COUNT}` as MessageKey
}

export function Home() {
  const app = useApp()
  const { t, tn } = useI18n()
  const { data, today, level } = app
  const [editing, setEditing] = useState<Habit | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const doneToday = data.completions[today] ?? []
  const doneCount = data.habits.filter((h) => doneToday.includes(h.id)).length
  const monthDays = activeDaysThisMonth(data, today)
  const ideas = useMemo(
    () => HABIT_SUGGESTIONS.filter((s) => !data.habits.some((h) => allTranslations(s.key).includes(h.name.toLowerCase()))),
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
      ? t('home.summary.empty')
      : doneCount === 0
        ? t('home.summary.none')
        : doneCount === data.habits.length
          ? t('home.summary.all')
          : t('home.summary.some', { done: doneCount, total: data.habits.length })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{data.profile.name ? `${t(greetingKey())}, ${data.profile.name}` : t(greetingKey())} 👋</h1>
        <p className="mt-1 text-ink-soft">
          {monthDays > 0 ? tn('home.showedUp', monthDays) : t('home.fresh')}
        </p>
      </header>

      <TryList />
      <BackupNudge />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <Card className="flex flex-col items-center gap-4 bg-gradient-to-b from-accent-soft to-surface text-center lg:self-start">
          <Companion level={level.level} name={data.companion.name} />
          <div className="-mt-2">
            <p className="text-xl font-extrabold">{data.companion.name}</p>
            <p className="text-sm text-ink-soft">{t('home.companion', { stage: t(`stage.${stageForLevel(level.level).stage}` as MessageKey) })}</p>
          </div>
          <div className="w-full">
            <XpBar info={level} />
          </div>
        </Card>

        <section aria-labelledby="habits-h">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 id="habits-h" className="text-xl font-extrabold tracking-tight">
                {t('home.habits.title')}
              </h2>
              <p className="text-sm text-ink-soft">{summary}</p>
            </div>
            <Button variant="soft" onClick={openAdd}>
              {t('home.add')}
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
              <SectionTitle hint={t('home.ideas.hint')}>{t('home.ideas.title')}</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {ideas.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => app.addHabit(s.emoji, t(s.key))}
                    className="rounded-full bg-surface2 px-4 py-2 text-sm font-semibold hover:bg-accent-soft"
                  >
                    <span aria-hidden="true">{s.emoji}</span> {t(s.key)}
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
