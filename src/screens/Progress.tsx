import { Companion } from '../components/Companion'
import { XpBar } from '../components/XpBar'
import { Card, SectionTitle } from '../components/ui/Card'
import { ACCESSORIES, PALETTES, STAGES } from '../data/unlocks'
import { formatMonthName, monthDays } from '../lib/dates'
import {
  activeDaysThisMonth,
  breathingMinutes,
  breathsThisMonth,
  checkInsThisMonth,
  habitDaysThisMonth,
  showedUpDays,
  totalHabitCompletions,
} from '../lib/stats'
import { useApp } from '../state/AppContext'

function Stat({ value, label, emoji }: { value: string | number; label: string; emoji: string }) {
  return (
    <div className="rounded-3xl bg-surface2 p-4">
      <p className="text-2xl" aria-hidden="true">{emoji}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
      <p className="text-sm text-ink-soft">{label}</p>
    </div>
  )
}

export function Progress() {
  const { data, today, level } = useApp()
  const days = activeDaysThisMonth(data, today)
  const showedUp = showedUpDays(data, today)
  const month = formatMonthName(today)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Progress</h1>
        <p className="mt-1 text-ink-soft">
          {days > 0 ? `${days} ${days === 1 ? 'day' : 'days'} this month. Look at you showing up.` : `${month} is wide open. No rush.`}
        </p>
      </header>

      <Card className="grid items-center gap-4 bg-gradient-to-b from-accent-soft to-surface sm:grid-cols-[auto_1fr]">
        <div className="mx-auto">
          <Companion level={level.level} name={data.companion.name} size={160} />
        </div>
        <div className="space-y-3">
          <p className="text-lg font-extrabold">{data.xp} XP earned in total</p>
          <XpBar info={level} />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat emoji="🌿" value={totalHabitCompletions(data)} label="tiny wins, ever" />
        <Stat emoji="🌬️" value={`${breathingMinutes(data)} min`} label={`breathing (${breathsThisMonth(data, today)} this month)`} />
        <Stat emoji="💭" value={checkInsThisMonth(data, today)} label="check-ins this month" />
        <Stat emoji="📅" value={days} label="days showed up" />
      </div>

      <Card>
        <SectionTitle hint={month}>Days you showed up</SectionTitle>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2" role="list" aria-label={`Days you showed up in ${month}`}>
          {monthDays(today).map((d) => {
            const on = showedUp.has(d)
            const isToday = d === today
            return (
              <div
                key={d}
                role="listitem"
                aria-label={`${d}${on ? ': showed up' : ''}`}
                className={`flex aspect-square items-center justify-center rounded-2xl text-sm font-bold ${
                  on ? 'bg-accent-grad text-on-accent' : 'bg-surface2 text-ink-soft'
                } ${isToday ? 'ring-2 ring-accent-strong ring-offset-2 ring-offset-surface' : ''}`}
              >
                {Number(d.slice(8))}
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-sm text-ink-soft">Quiet days are just quiet days. Nothing is broken.</p>
      </Card>

      {data.habits.length > 0 && (
        <Card>
          <SectionTitle>By habit</SectionTitle>
          <ul className="space-y-2">
            {data.habits.map((h) => (
              <li key={h.id} className="flex items-center justify-between rounded-2xl bg-surface2 px-4 py-3">
                <span className="font-semibold">
                  <span aria-hidden="true">{h.emoji}</span> {h.name}
                </span>
                <span className="text-sm font-bold text-accent-strong">{habitDaysThisMonth(data, h.id, today)} days this month</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <SectionTitle>Unlocks</SectionTitle>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            ...STAGES.filter((s) => s.stage > 1).map((s) => ({ key: `s${s.stage}`, icon: '🌱', label: `Companion: ${s.name}`, lvl: s.unlockLevel })),
            ...ACCESSORIES.map((a) => ({ key: a.id, icon: '🎀', label: a.name, lvl: a.unlockLevel })),
            ...PALETTES.filter((p) => p.unlockLevel > 1).map((p) => ({ key: p.id, icon: '🎨', label: `${p.name} theme`, lvl: p.unlockLevel })),
          ]
            .sort((a, b) => a.lvl - b.lvl)
            .map((u) => {
              const got = level.level >= u.lvl
              return (
                <li key={u.key} className={`flex items-center justify-between rounded-2xl px-4 py-3 ${got ? 'bg-accent-soft text-accent-strong' : 'bg-surface2 text-ink-soft'}`}>
                  <span className="font-semibold">
                    <span aria-hidden="true">{got ? u.icon : '🔒'}</span> {u.label}
                  </span>
                  <span className="text-sm font-bold">{got ? 'Unlocked' : `Level ${u.lvl}`}</span>
                </li>
              )
            })}
        </ul>
      </Card>
    </div>
  )
}
