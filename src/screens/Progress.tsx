import { useState } from 'react'
import { Companion } from '../components/Companion'
import { XpBar } from '../components/XpBar'
import { Card, SectionTitle } from '../components/ui/Card'
import { ACCESSORIES, GARDEN_FROM_LEVEL, GARDEN_PLANTS, PALETTES, STAGES, gardenSize, levelForPlant, stageForLevel } from '../data/unlocks'
import { useI18n } from '../i18n'
import type { MessageKey } from '../i18n/en'
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

/** The highest level that unlocks anything today (the crown). */
const MAX_PREVIEW_LEVEL = 15

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
  const { t, tn, locale } = useI18n()
  const days = activeDaysThisMonth(data, today)
  const showedUp = showedUpDays(data, today)
  const month = formatMonthName(today, locale)
  const [previewLevel, setPreviewLevel] = useState(Math.min(level.level, MAX_PREVIEW_LEVEL))
  const garden = gardenSize(level.level)
  const wearing = ACCESSORIES.filter((a) => previewLevel >= a.unlockLevel).map((a) => t(`accessory.${a.id}` as MessageKey).toLowerCase())
  const stageName = (lvl: number) => t(`stage.${stageForLevel(lvl).stage}` as MessageKey)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t('progress.title')}</h1>
        <p className="mt-1 text-ink-soft">{days > 0 ? tn('progress.sub', days) : t('progress.sub.open', { month })}</p>
      </header>

      <Card className="grid items-center gap-4 bg-gradient-to-b from-accent-soft to-surface sm:grid-cols-[auto_1fr]">
        <div className="mx-auto">
          <Companion level={level.level} name={data.companion.name} size={160} />
        </div>
        <div className="space-y-3">
          <p className="text-lg font-extrabold">{t('progress.xpTotal', { xp: data.xp })}</p>
          <XpBar info={level} />
        </div>
      </Card>

      <Card>
        <SectionTitle hint={t('progress.preview.hint')}>{t('progress.preview.title')}</SectionTitle>
        <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr]">
          <div className="mx-auto">
            <Companion level={previewLevel} name={data.companion.name} size={140} />
          </div>
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block font-bold" id="preview-level-label">
                {t('progress.preview.level', { n: previewLevel, stage: stageName(previewLevel) })}
              </span>
              <input
                type="range"
                min={1}
                max={MAX_PREVIEW_LEVEL}
                value={previewLevel}
                onChange={(e) => setPreviewLevel(Number(e.target.value))}
                aria-labelledby="preview-level-label"
                aria-valuetext={t('progress.preview.aria', { n: previewLevel, stage: stageName(previewLevel) })}
                className="w-full accent-[var(--accent-strong)]"
              />
            </label>
            <p className="text-sm text-ink-soft">
              {wearing.length ? t('progress.preview.wearing', { list: wearing.join(', ') }) : t('progress.preview.none')}{' '}
              {t('progress.preview.note', { n: level.level })}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle hint={garden > 0 ? tn('garden.count', garden) : undefined}>{t('garden.title')}</SectionTitle>
        {garden > 0 ? (
          <>
            <ul className="flex flex-wrap gap-3">
              {GARDEN_PLANTS.slice(0, garden).map((plant, i) => (
                <li key={plant} className="flex h-16 w-16 items-center justify-center rounded-3xl bg-accent-soft text-4xl">
                  <span aria-hidden="true">{plant}</span>
                  <span className="sr-only">{t('garden.plant', { n: i + 1 })}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-ink-soft">
              {garden < GARDEN_PLANTS.length ? t('garden.next', { n: levelForPlant(garden + 1) }) : t('garden.full')}
            </p>
          </>
        ) : (
          <p className="text-ink-soft">{t('garden.locked', { n: GARDEN_FROM_LEVEL, name: data.companion.name })}</p>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat emoji="🌿" value={totalHabitCompletions(data)} label={t('stat.wins')} />
        <Stat emoji="🌬️" value={t('stat.min', { n: breathingMinutes(data) })} label={t('stat.breath', { n: breathsThisMonth(data, today) })} />
        <Stat emoji="💭" value={checkInsThisMonth(data, today)} label={t('stat.checkins')} />
        <Stat emoji="📅" value={days} label={t('stat.days')} />
      </div>

      <Card>
        <SectionTitle hint={month}>{t('progress.calendar')}</SectionTitle>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2" role="list" aria-label={t('progress.calendar.aria', { month })}>
          {monthDays(today).map((d) => {
            const on = showedUp.has(d)
            const isToday = d === today
            return (
              <div
                key={d}
                role="listitem"
                aria-label={on ? t('progress.day.on', { date: d }) : d}
                className={`flex aspect-square items-center justify-center rounded-2xl text-sm font-bold ${
                  on ? 'bg-accent-grad text-on-accent' : 'bg-surface2 text-ink-soft'
                } ${isToday ? 'ring-2 ring-accent-strong ring-offset-2 ring-offset-surface' : ''}`}
              >
                {Number(d.slice(8))}
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-sm text-ink-soft">{t('progress.calendar.note')}</p>
      </Card>

      {data.habits.length > 0 && (
        <Card>
          <SectionTitle>{t('progress.byHabit')}</SectionTitle>
          <ul className="space-y-2">
            {data.habits.map((h) => (
              <li key={h.id} className="flex items-center justify-between rounded-2xl bg-surface2 px-4 py-3">
                <span className="font-semibold">
                  <span aria-hidden="true">{h.emoji}</span> {h.name}
                </span>
                <span className="text-sm font-bold text-accent-strong">{tn('habit.row.days', habitDaysThisMonth(data, h.id, today))}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <SectionTitle>{t('progress.unlocks')}</SectionTitle>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            ...STAGES.filter((s) => s.stage > 1).map((s) => ({
              key: `s${s.stage}`,
              icon: '🌱',
              label: t('progress.companion', { name: t(`stage.${s.stage}` as MessageKey) }),
              lvl: s.unlockLevel,
            })),
            ...ACCESSORIES.map((a) => ({ key: a.id, icon: '🎀', label: t(`accessory.${a.id}` as MessageKey), lvl: a.unlockLevel })),
            { key: 'garden', icon: '🪴', label: t('garden.opens'), lvl: GARDEN_FROM_LEVEL },
            ...PALETTES.filter((p) => p.unlockLevel > 1).map((p) => ({
              key: p.id,
              icon: '🎨',
              label: t('unlock.theme', { name: t(`palette.${p.id}` as MessageKey) }),
              lvl: p.unlockLevel,
            })),
          ]
            .sort((a, b) => a.lvl - b.lvl)
            .map((u) => {
              const got = level.level >= u.lvl
              return (
                <li key={u.key} className={`flex items-center justify-between rounded-2xl px-4 py-3 ${got ? 'bg-accent-soft text-accent-strong' : 'bg-surface2 text-ink-soft'}`}>
                  <span className="font-semibold">
                    <span aria-hidden="true">{got ? u.icon : '🔒'}</span> {u.label}
                  </span>
                  <span className="text-sm font-bold">{got ? t('progress.unlocked') : t('progress.levelN', { n: u.lvl })}</span>
                </li>
              )
            })}
        </ul>
      </Card>
    </div>
  )
}
