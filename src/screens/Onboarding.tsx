import { AnimatePresence, m } from 'framer-motion'
import { useState } from 'react'
import { useAbout } from '../components/About'
import { Companion } from '../components/Companion'
import { LanguageSwitch } from '../components/LanguageSwitch'
import { Button } from '../components/ui/Button'
import { APP_NAME } from '../config/app'
import { HABIT_SUGGESTIONS } from '../data/content'
import { useI18n } from '../i18n'
import { XP_REWARDS } from '../lib/xp'
import { useApp } from '../state/AppContext'

export function Onboarding() {
  const app = useApp()
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
              <Companion level={1} name="Sprout" size={200} />
              <h1 className="text-4xl font-black tracking-tight">{t('onb.welcome', { app: APP_NAME })}</h1>
              <p className="text-lg text-ink-soft">{t('onb.intro')}</p>
              <ul className="grid grid-cols-3 gap-2 text-sm font-bold">
                <li className="rounded-2xl bg-accent-soft p-3 text-accent-strong">🌿 {t('common.habit')}<br />+{XP_REWARDS.habit}</li>
                <li className="rounded-2xl bg-accent-soft p-3 text-accent-strong">🌬️ {t('nav.breathe')}<br />+{XP_REWARDS.breathing}</li>
                <li className="rounded-2xl bg-accent-soft p-3 text-accent-strong">💭 {t('nav.checkin')}<br />+{XP_REWARDS.checkin}</li>
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
