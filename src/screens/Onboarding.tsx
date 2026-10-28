import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Companion } from '../components/Companion'
import { Button } from '../components/ui/Button'
import { APP_NAME } from '../config/app'
import { HABIT_SUGGESTIONS } from '../data/content'
import { XP_REWARDS } from '../lib/xp'
import { useApp } from '../state/AppContext'

export function Onboarding() {
  const app = useApp()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [picked, setPicked] = useState<string[]>(['Drink water', 'Step outside'])

  const toggle = (n: string) => setPicked((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]))
  const finish = () => {
    app.finishOnboarding(name, HABIT_SUGGESTIONS.filter((s) => picked.includes(s.name)))
    window.location.hash = '#/home'
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          className="space-y-6 text-center"
        >
          {step === 0 && (
            <>
              <Companion level={1} name="Sprout" size={200} />
              <h1 className="text-4xl font-black tracking-tight">Welcome to {APP_NAME}</h1>
              <p className="text-lg text-ink-soft">
                Tiny self-care wins that grow a little plant friend. Every habit, breath and check-in earns XP. No streaks to lose, no guilt, ever.
              </p>
              <ul className="grid grid-cols-3 gap-2 text-sm font-bold">
                <li className="rounded-2xl bg-accent-soft p-3 text-accent-strong">🌿 Habit<br />+{XP_REWARDS.habit}</li>
                <li className="rounded-2xl bg-accent-soft p-3 text-accent-strong">🌬️ Breathe<br />+{XP_REWARDS.breathing}</li>
                <li className="rounded-2xl bg-accent-soft p-3 text-accent-strong">💭 Check-in<br />+{XP_REWARDS.checkin}</li>
              </ul>
            </>
          )}
          {step === 1 && (
            <>
              <p className="text-6xl" aria-hidden="true">👋</p>
              <h1 className="text-3xl font-black">What should we call you?</h1>
              <input
                autoFocus
                value={name}
                maxLength={24}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setStep(2)}
                placeholder="Your name or nickname"
                aria-label="Your name"
                className="h-14 w-full rounded-2xl border border-line bg-surface px-4 text-center text-lg"
              />
              <p className="text-sm text-ink-soft">Totally optional. Stays on your device.</p>
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="text-3xl font-black">Pick a few tiny habits</h1>
              <p className="text-ink-soft">Small is the point. You can change these any time.</p>
              <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Starter habits">
                {HABIT_SUGGESTIONS.map((s) => {
                  const on = picked.includes(s.name)
                  return (
                    <button
                      key={s.name}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(s.name)}
                      className={`rounded-full border-2 px-4 py-2.5 font-semibold ${
                        on ? 'border-accent-strong bg-accent-soft text-accent-strong' : 'border-line bg-surface'
                      }`}
                    >
                      <span aria-hidden="true">{s.emoji}</span> {s.name}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between">
        <div className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-6 bg-accent-strong' : 'w-2 bg-line'}`} />
          ))}
        </div>
        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 2 ? (
            <Button onClick={() => setStep(step + 1)}>{step === 0 ? 'Let’s go' : name.trim() ? 'Next' : 'Skip'}</Button>
          ) : (
            <Button onClick={finish}>Start glowing ✨</Button>
          )}
        </div>
      </div>
    </div>
  )
}
