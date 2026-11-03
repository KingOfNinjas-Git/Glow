import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useAbout } from '../components/About'
import { Companion } from '../components/Companion'
import { LanguageSwitch } from '../components/LanguageSwitch'
import { Button } from '../components/ui/Button'
import { APP_NAME } from '../config/app'
import { HABIT_SUGGESTIONS } from '../data/content'
import { useI18n } from '../i18n'
import { XP_REWARDS } from '../lib/xp'
import { useApp } from '../state/AppContext'

/** Levels the welcome plant grows through: seed, sprout, seedling, leafy, budding. */
const WELCOME_LEVELS = [1, 2, 4, 7, 10]

export function Onboarding() {
  const app = useApp()
  const reduce = !!useReducedMotion()
  // the plant grows once while the page is read, to show what the app is about; no motion means it starts grown
  const [growth, setGrowth] = useState(0)
  const welcomeLevel = WELCOME_LEVELS[reduce ? WELCOME_LEVELS.length - 1 : growth]
  useEffect(() => {
    if (reduce || growth >= WELCOME_LEVELS.length - 1) return
    const id = window.setTimeout(() => setGrowth((g) => g + 1), growth === 0 ? 1100 : 900)
    return () => window.clearTimeout(id)
  }, [growth, reduce])
  const about = useAbout()
  const { t } = useI18n()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  // starter habits are remembered by their key, so switching language while choosing keeps the choice
  const [picked, setPicked] = useState<string[]>(['habit.water', 'habit.outside'])

  const toggle = (key: string) => setPicked((p) => (p.includes(key) ? p.filter((x) => x !== key) : [...p, key]))
  const finish = () => {
    app.finishOnboarding(
      name,
      HABIT_SUGGESTIONS.filter((s) => picked.includes(s.key)).map((s) => ({ emoji: s.emoji, name: t(s.key) })),
    )
    window.location.hash = '#/home'
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <AnimatePresence mode="wait">
        <m.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          className="space-y-6 text-center"
        >
          {step === 0 && (
            <>
              {/* fixed height so the heading does not drop as the plant gets taller; the pot stays where it is */}
              <div className="flex h-[200px] items-end justify-center">
                <Companion level={welcomeLevel} name="Sprout" size={200} />
              </div>
              <h1 className="text-4xl font-black tracking-tight">{t('onb.welcome', { app: APP_NAME })}</h1>
              <p className="text-lg text-ink-soft">{t('onb.intro')}</p>
              <ul className="grid grid-cols-3 gap-2 text-sm font-bold">
                {[
                  { icon: <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14M5 19l7-7" />, label: t('common.habit'), xp: XP_REWARDS.habit },
                  { icon: <path d="M3 9h11a3 3 0 1 0-3-3M3 14h15a3 3 0 1 1-3 3M3 19h7" />, label: t('nav.breathe'), xp: XP_REWARDS.breathing },
                  { icon: <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />, label: t('nav.checkin'), xp: XP_REWARDS.checkin },
                ].map(({ icon, label, xp }) => (
                  <li key={label} className="flex flex-col items-center gap-1 rounded-2xl bg-accent-soft p-3 text-accent-strong">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {icon}
                    </svg>
                    {label}
                    <span className="font-semibold text-ink-soft">+{xp} XP</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {step === 1 && (
            <>
              <p className="text-6xl" aria-hidden="true">👋</p>
              <h1 className="text-3xl font-black">{t('onb.name.title')}</h1>
              <input
                autoFocus
                value={name}
                maxLength={24}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setStep(2)}
                placeholder={t('onb.name.placeholder')}
                aria-label={t('onb.name.aria')}
                className="h-14 w-full rounded-2xl border border-line bg-surface px-4 text-center text-lg"
              />
              <p className="text-sm text-ink-soft">{t('onb.name.hint')}</p>
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="text-3xl font-black">{t('onb.habits.title')}</h1>
              <p className="text-ink-soft">{t('onb.habits.hint')}</p>
              <div className="flex flex-wrap justify-center gap-2" role="group" aria-label={t('onb.habits.group')}>
                {HABIT_SUGGESTIONS.map((s) => {
                  const on = picked.includes(s.key)
                  return (
                    <button
                      key={s.key}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(s.key)}
                      className={`rounded-full border-2 px-4 py-2.5 font-semibold ${
                        on ? 'border-accent-strong bg-accent-soft text-accent-strong' : 'border-line bg-surface'
                      }`}
                    >
                      <span aria-hidden="true">{s.emoji}</span> {t(s.key)}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </m.div>
      </AnimatePresence>

      {step === 0 ? (
        <div className="mt-8 flex flex-col gap-3">
          <Button
            size="lg"
            onClick={() => {
              app.loadSample(t)
              window.location.hash = '#/home'
            }}
          >
            {t('onb.sample')}
          </Button>
          <Button size="lg" variant="soft" onClick={() => setStep(1)}>
            {t('onb.fresh')}
          </Button>
          <p className="text-center text-sm text-ink-soft">{t('onb.noaccount')}</p>
          <button type="button" onClick={about} className="mx-auto text-sm font-bold text-accent-strong underline">
            {t('nav.about')}
          </button>
          <LanguageSwitch className="mt-2" />
        </div>
      ) : (
        <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-6 bg-accent-strong' : 'w-2 bg-line'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              {t('common.back')}
            </Button>
            {step < 2 ? (
              <Button onClick={() => setStep(step + 1)}>{name.trim() ? t('onb.next') : t('onb.skip')}</Button>
            ) : (
              <Button onClick={finish}>{t('onb.start')}</Button>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
